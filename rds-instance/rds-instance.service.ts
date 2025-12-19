import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {ConfigService} from '@nestjs/config';
import {DescribeDBInstancesCommand, RDSClient} from '@aws-sdk/client-rds';
import {FetchEC2InstancesDto} from '@microservices/cloudwatch/ec2-instance/ec2-instance.dto';
import {AWSRegion} from '@prisma/client';
import {ListRDSInstancesDto, SyncRDSInstancesWatchDto} from '@microservices/cloudwatch/rds-instance/rds-instance.dto';
import {CloudwatchService} from '@microservices/cloudwatch/cloudwatch.service';

@Injectable()
export class RDSInstanceService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cloudwatchService: CloudwatchService
  ) {}

  async listRDSInstances(data: ListRDSInstancesDto) {
    const {awsAccountId, isWatching} = data;
    const rdsInstances = await this.prisma.rdsInstance.findMany({
      where: {
        awsAccountId,
        isWatching: isWatching === 'true' || isWatching === '1' ? true : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return rdsInstances;
  }

  async fetchRDSInstances(data: FetchEC2InstancesDto) {
    const {awsAccountId} = data;
    const awsAccount = await this.prisma.awsAccount.findUniqueOrThrow({where: {id: awsAccountId}});
    const {accessKeyId, secretAccessKey, regions} = awsAccount;

    // Just for test.
    // const accessKeyId = <string>this.configService.get('microservices.aws-ses.accessKeyId');
    // const secretAccessKey = <string>this.configService.get('microservices.aws-ses.secretAccessKey');
    // const {regions} = awsAccount;

    const rdsInstances: {
      name: string;
      status: string;
      region: AWSRegion;
      remoteId: string;
      awsAccountId: string;
    }[] = [];

    for (let i = 0; i < regions.length; i++) {
      const region = regions[i].replaceAll('_', '-');
      const client = new RDSClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey: this.cloudwatchService.decryptSecretAccessKey(secretAccessKey),
        },
      });

      const response = await client.send(new DescribeDBInstancesCommand({MaxRecords: 100}));
      if (response.DBInstances) {
        for (const dbInstance of response.DBInstances) {
          const id = <string>dbInstance.DBInstanceIdentifier;

          let name: string | null = id;
          if (dbInstance.TagList) {
            const nameTag = dbInstance.TagList.find(tag => tag.Key === 'Name');
            if (nameTag && nameTag.Value) {
              name = nameTag.Value;
            }
          }
          rdsInstances.push({
            name,
            status: dbInstance.DBInstanceStatus!,
            region: regions[i],
            remoteId: id,
            awsAccountId,
          });
        }
      }
    }

    if (rdsInstances.length) {
      await this.prisma.$transaction(async tx => {
        const currentRemoteIdObjs = await tx.rdsInstance.findMany({
          where: {
            awsAccountId,
          },
          select: {
            remoteId: true,
          },
        });
        const rdsInstanceRemoteIds = rdsInstances.map(item => item.remoteId);
        const deleteIds = currentRemoteIdObjs
          .filter(item => !rdsInstanceRemoteIds.includes(item.remoteId))
          .map(item => item.remoteId);
        if (deleteIds.length) {
          await tx.rdsInstance.deleteMany({
            where: {
              awsAccountId,
              remoteId: {
                in: deleteIds,
              },
            },
          });
        }
        for (const rdsInstance of rdsInstances) {
          await tx.rdsInstance.upsert({
            where: {
              awsAccountId_region_remoteId: {
                awsAccountId,
                region: rdsInstance.region,
                remoteId: rdsInstance.remoteId,
              },
            },
            update: {
              name: rdsInstance.name,
              status: rdsInstance.status,
              region: rdsInstance.region,
            },
            create: {
              name: rdsInstance.name,
              status: rdsInstance.status,
              region: rdsInstance.region,
              remoteId: rdsInstance.remoteId,
              awsAccountId,
            },
          });
        }
      });
    }

    return true;
  }

  async syncRDSInstancesWatch(data: SyncRDSInstancesWatchDto) {
    let needWatch = false;
    let needUnwatch = false;
    const {awsAccountId, watchRDSInstanceIds, unwatchRDSInstanceIds} = data;
    if (watchRDSInstanceIds.length) {
      const watchRDSInstances = await this.prisma.rdsInstance.findMany({
        where: {
          id: {
            in: watchRDSInstanceIds,
          },
          awsAccountId,
        },
      });
      if (watchRDSInstances.length !== watchRDSInstanceIds.length) {
        throw new HttpException('The number of RDS instance IDs to watch does not match', HttpStatus.BAD_REQUEST);
      }
      needWatch = true;
    }
    if (unwatchRDSInstanceIds.length) {
      const unwatchRDSInstances = await this.prisma.rdsInstance.findMany({
        where: {
          id: {
            in: unwatchRDSInstanceIds,
          },
          awsAccountId,
        },
      });
      if (unwatchRDSInstances.length !== unwatchRDSInstanceIds.length) {
        throw new HttpException('The number of RDS instance IDs to unwatch does not match', HttpStatus.BAD_REQUEST);
      }
      needUnwatch = true;
    }

    if (needWatch || needUnwatch) {
      await this.prisma.$transaction(async tx => {
        if (needWatch) {
          await tx.rdsInstance.updateMany({
            where: {
              id: {
                in: watchRDSInstanceIds,
              },
            },
            data: {
              isWatching: true,
            },
          });
        }
        if (needUnwatch) {
          await tx.rdsInstance.updateMany({
            where: {
              id: {
                in: unwatchRDSInstanceIds,
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
