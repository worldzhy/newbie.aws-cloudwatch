import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {DescribeInstancesCommand, EC2Client} from '@aws-sdk/client-ec2';
import {AWSRegion, Prisma} from '@prisma/client';
import {
  FetchEC2InstancesDto,
  ListEC2InstancesDto,
  SyncEC2InstancesWatchDto,
} from '@microservices/cloudwatch/ec2-instance/ec2-instance.dto';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class EC2InstanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

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
    // const {accessKeyId, secretAccessKey, regions} = awsAccount;
    const {regions} = awsAccount;

    // Just for test.
    const accessKeyId = <string>this.configService.get('microservices.aws-ses.accessKeyId');
    const secretAccessKey = <string>this.configService.get('microservices.aws-ses.secretAccessKey');

    const ec2Instances: {
      name: string;
      status: string;
      region: AWSRegion;
      remoteId: string;
      awsAccountId: string;
    }[] = [];

    for (let i = 0; i < regions.length; i++) {
      const region = regions[i].replaceAll('_', '-');
      const client = new EC2Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const response = await client.send(new DescribeInstancesCommand({MaxResults: 1000}));
      if (response.Reservations) {
        const ec2InstanceCreateManyInputs: Prisma.Ec2InstanceCreateManyInput[] = [];
        for (const reservation of response.Reservations) {
          if (reservation.Instances) {
            for (const inst of reservation.Instances) {
              const id = inst.InstanceId!;
              const state = inst.State?.Name as string;
              const nameTag = inst.Tags?.find(t => t.Key === 'Name');
              ec2Instances.push({
                name: nameTag?.Value ?? id,
                status: state,
                region: regions[i],
                remoteId: id,
                awsAccountId,
              });
            }
          }
        }
      }
    }

    if (ec2Instances.length) {
      await this.prisma.$transaction(async tx => {
        const currentRemoteIdObjs = await tx.ec2Instance.findMany({
          where: {
            awsAccountId,
          },
          select: {
            remoteId: true,
          },
        });
        const ec2InstanceRemoteIds = ec2Instances.map(item => item.remoteId);
        const deleteIds = currentRemoteIdObjs
          .filter(item => !ec2InstanceRemoteIds.includes(item.remoteId))
          .map(item => item.remoteId);
        if (deleteIds.length) {
          await tx.ec2Instance.deleteMany({
            where: {
              awsAccountId,
              remoteId: {
                in: deleteIds,
              },
            },
          });
        }
        for (const ec2Instance of ec2Instances) {
          await tx.ec2Instance.upsert({
            where: {
              awsAccountId_region_remoteId: {
                awsAccountId,
                region: ec2Instance.region,
                remoteId: ec2Instance.remoteId,
              },
            },
            update: {
              name: ec2Instance.name,
              status: ec2Instance.status,
              region: ec2Instance.region,
            },
            create: {
              name: ec2Instance.name,
              status: ec2Instance.status,
              region: ec2Instance.region,
              remoteId: ec2Instance.remoteId,
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

      return true;
    }
  }
}
