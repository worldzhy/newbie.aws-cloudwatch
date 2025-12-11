import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {ConfigService} from '@nestjs/config';
import {isArray, isString} from 'class-validator';
import {ListRDSInstancesDto} from '@/application/backend-monitor/rds-instance/rds-instance.dto';
import {DescribeDBInstancesCommand, RDSClient} from '@aws-sdk/client-rds';

@Injectable()
export class RDSInstanceService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async listRDSInstances(data: ListRDSInstancesDto) {
    const results: {id: string; name: string | null}[] = [];
    const {projectId, onlyMonitored} = data;
    // Check if project exists.
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.BAD_REQUEST);
    }
    let monitoredIds: string[] | undefined;
    if (isString(onlyMonitored) && (onlyMonitored.toLowerCase() === 'true' || onlyMonitored === '1')) {
      if (isArray(project.monitoredRDSIds) && project.monitoredRDSIds.length) {
        monitoredIds = <string[]>project.monitoredRDSIds;
      } else {
        return results;
      }
    }

    // Just for test.
    const awsKey = <string>this.configService.get('microservices.aws-ses.accessKeyId');
    const awsSecret = <string>this.configService.get('microservices.aws-ses.secretAccessKey');
    const region = <string>this.configService.get('microservices.aws-ses.region');

    const rdsClient = new RDSClient({
      region,
      credentials: {
        accessKeyId: awsKey,
        secretAccessKey: awsSecret,
      },
    });

    const params: any = {};
    if (monitoredIds) {
      params.Filters = [
        {
          Name: 'db-instance-id',
          Values: monitoredIds,
        },
      ];
    } else {
      params.MaxRecords = 100;
    }
    console.log(JSON.stringify(params));
    const command = new DescribeDBInstancesCommand(params);
    const response = await rdsClient.send(command);
    for (const db of response.DBInstances ?? []) {
      const id = <string>db.DBInstanceIdentifier;
      console.log(id);

      let name: string | null = id;
      if (db.TagList) {
        const nameTag = db.TagList.find(tag => tag.Key === 'Name');
        if (nameTag && nameTag.Value) {
          name = nameTag.Value;
        }
      }
      results.push({id, name});
    }

    return results;
  }
}
