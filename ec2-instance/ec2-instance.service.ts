import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {DescribeInstancesCommand, EC2Client} from '@aws-sdk/client-ec2';
import {Prisma} from '@prisma/client';
import {
  FetchEC2InstancesDto,
  ListEC2InstancesDto,
  SyncEC2InstancesWatchDto,
} from '@microservices/aws-cloudwatch/ec2-instance/ec2-instance.dto';
import {ConfigService} from '@nestjs/config';
import {decryptString} from '@framework/utilities/crypto.util';

@Injectable()
export class EC2InstanceService {
  private readonly encryptKey: string;
  private readonly encryptIV: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.encryptKey = this.configService.get('microservices.cloudwatch.cryptoEncryptKey') as string;
    this.encryptIV = this.configService.get('microservices.cloudwatch.cryptoEncryptIV') as string;
  }

  async listEC2Instances(data: ListEC2InstancesDto) {
    const {awsAccountId, isWatching} = data;
    const ec2Instances = await this.prisma.ec2Instance.findMany({
      where: {
        awsAccountId,
        isWatching: isWatching === 'true' || isWatching === '1' ? true : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return ec2Instances;
  }

  async fetchEC2Instances(data: FetchEC2InstancesDto) {
    const {awsAccountId} = data;
    const awsAccount = await this.prisma.awsAccount.findUniqueOrThrow({where: {id: awsAccountId}});
    const {accessKeyId, secretAccessKey, regions} = awsAccount;
    const ec2Instances: Prisma.Ec2InstanceCreateManyInput[] = [];

    for (let i = 0; i < regions.length; i++) {
      const region = regions[i].replaceAll('_', '-');
      const client = new EC2Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey: decryptString(secretAccessKey, this.encryptKey, this.encryptIV),
        },
      });

      const response = await client.send(new DescribeInstancesCommand({MaxResults: 1000}));
      if (response.Reservations) {
        for (const reservation of response.Reservations) {
          if (reservation.Instances) {
            for (const instance of reservation.Instances) {
              const id = instance.InstanceId!;
              const state = instance.State?.Name as string;
              const nameTag = instance.Tags?.find(t => t.Key === 'Name');
              ec2Instances.push({
                instanceId: id,
                name: nameTag?.Value ?? id,
                status: state,
                region: regions[i],
                awsAccountId,
              });
            }
          }
        }
      }
    }

    if (ec2Instances.length) {
      await this.prisma.$transaction(async tx => {
        const currentInstanceIdObjs = await tx.ec2Instance.findMany({
          where: {awsAccountId},
          select: {instanceId: true},
        });
        const ec2InstanceRemoteIds = ec2Instances.map(item => item.instanceId);
        const deleteIds = currentInstanceIdObjs
          .filter(item => !ec2InstanceRemoteIds.includes(item.instanceId))
          .map(item => item.instanceId);
        if (deleteIds.length) {
          await tx.ec2Instance.deleteMany({
            where: {
              instanceId: {in: deleteIds},
            },
          });
        }
        for (const ec2Instance of ec2Instances) {
          await tx.ec2Instance.upsert({
            where: {instanceId: ec2Instance.instanceId},
            update: {
              name: ec2Instance.name,
              status: ec2Instance.status,
              region: ec2Instance.region,
            },
            create: {
              instanceId: ec2Instance.instanceId,
              name: ec2Instance.name,
              status: ec2Instance.status,
              region: ec2Instance.region,
              awsAccountId,
            },
          });
        }
      });
    }

    return true;
  }

  async syncEC2InstancesWatch(data: SyncEC2InstancesWatchDto) {
    let needWatch = false;
    let needUnwatch = false;
    const {awsAccountId, watchEC2InstanceIds, unwatchEC2InstanceIds} = data;
    if (watchEC2InstanceIds.length) {
      const watchEC2Instances = await this.prisma.ec2Instance.findMany({
        where: {
          id: {
            in: watchEC2InstanceIds,
          },
          awsAccountId,
        },
      });
      if (watchEC2Instances.length !== watchEC2InstanceIds.length) {
        throw new HttpException('The number of EC2 instance IDs to watch does not match', HttpStatus.BAD_REQUEST);
      }
      needWatch = true;
    }
    if (unwatchEC2InstanceIds.length) {
      const unwatchEC2Instances = await this.prisma.ec2Instance.findMany({
        where: {
          id: {
            in: unwatchEC2InstanceIds,
          },
          awsAccountId,
        },
      });
      if (unwatchEC2Instances.length !== unwatchEC2InstanceIds.length) {
        throw new HttpException('The number of EC2 instance IDs to unwatch does not match', HttpStatus.BAD_REQUEST);
      }
      needUnwatch = true;
    }

    if (needWatch || needUnwatch) {
      await this.prisma.$transaction(async tx => {
        if (needWatch) {
          await tx.ec2Instance.updateMany({
            where: {
              id: {
                in: watchEC2InstanceIds,
              },
            },
            data: {
              isWatching: true,
            },
          });
        }
        if (needUnwatch) {
          await tx.ec2Instance.updateMany({
            where: {
              id: {
                in: unwatchEC2InstanceIds,
              },
            },
            data: {
              isWatching: false,
            },
          });
        }
      });
    }

    return true;
  }

  async watchEC2Instance(ec2InstanceId: string) {
    const ec2Instance = await this.prisma.ec2Instance.findUniqueOrThrow({
      where: {
        id: ec2InstanceId,
      },
    });
    await this.prisma.ec2Instance.update({
      where: {
        id: ec2Instance.id,
      },
      data: {
        isWatching: true,
      },
    });
    return true;
  }

  async unwatchEC2Instance(ec2InstanceId: string) {
    const ec2Instance = await this.prisma.ec2Instance.findUniqueOrThrow({
      where: {
        id: ec2InstanceId,
      },
    });
    await this.prisma.ec2Instance.update({
      where: {
        id: ec2Instance.id,
      },
      data: {
        isWatching: false,
      },
    });
    return true;
  }
}
