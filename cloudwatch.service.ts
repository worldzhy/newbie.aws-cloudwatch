import {Injectable} from '@nestjs/common';
import {CloudWatchClient, GetMetricDataCommand} from '@aws-sdk/client-cloudwatch';
import {CloudwatchMetricRDSMetricName, CloudwatchMetricStatistics} from '@microservices/cloudwatch/cloudwatch.enum';
import {ConfigService} from '@nestjs/config';

const CryptoJS = require('crypto-js');

@Injectable()
export class CloudwatchService {
  constructor(private readonly configService: ConfigService) {}

  private initCloudwatchClient(args: {accessKeyId?: string; secretAccessKey?: string; region: string}) {
    const {accessKeyId, secretAccessKey, region} = args;
    let client: CloudWatchClient;
    if (accessKeyId && secretAccessKey) {
      client = new CloudWatchClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      client = new CloudWatchClient({
        region,
      });
    }
    return client;
  }

  async getEC2InstancesCPUMetric(args: {
    ec2InstanceRemoteIds: string[];
    region: string;
    startTime: Date;
    endTime: Date;
    period: number;
    statistics: CloudwatchMetricStatistics;
    accessKeyId?: string;
    secretAccessKey?: string;
  }) {
    const {ec2InstanceRemoteIds, accessKeyId, secretAccessKey, region, startTime, endTime, period, statistics} = args;
    const cloudwatchClient = this.initCloudwatchClient({
      accessKeyId,
      secretAccessKey,
      region,
    });
    if (ec2InstanceRemoteIds.length) {
      const queries = ec2InstanceRemoteIds.map((id, idx) => ({
        Id: `cpu${idx}`,
        MetricStat: {
          Metric: {
            Namespace: 'AWS/EC2',
            MetricName: 'CPUUtilization',
            Dimensions: [
              {
                Name: 'InstanceId',
                Value: id,
              },
            ],
          },
          Period: period,
          Stat: statistics,
        },
        ReturnData: true,
      }));
      const command = new GetMetricDataCommand({
        StartTime: startTime,
        EndTime: endTime,
        MetricDataQueries: queries,
      });
      return await cloudwatchClient.send(command);
    }
    return null;
  }

  async getRDSInstancesMetric(args: {
    rdsInstanceRemoteIds: string[];
    metricName: CloudwatchMetricRDSMetricName;
    region: string;
    instanceId: string;
    startTime: Date;
    endTime: Date;
    period: number;
    statistics: CloudwatchMetricStatistics;
    accessKeyId?: string;
    secretAccessKey?: string;
  }) {
    const {
      rdsInstanceRemoteIds,
      accessKeyId,
      secretAccessKey,
      metricName,
      region,
      startTime,
      endTime,
      period,
      statistics,
    } = args;
    const cloudwatchClient = this.initCloudwatchClient({
      accessKeyId,
      secretAccessKey,
      region,
    });
    if (rdsInstanceRemoteIds.length) {
      const queries = rdsInstanceRemoteIds.map((id, index) => ({
        Id: `q${index}`,
        MetricStat: {
          Metric: {
            Namespace: 'AWS/RDS',
            MetricName: metricName,
            Dimensions: [{Name: 'DBInstanceIdentifier', Value: id}],
          },
          Period: period,
          Stat: statistics,
        },
      }));
      const command = new GetMetricDataCommand({
        StartTime: startTime,
        EndTime: endTime,
        MetricDataQueries: queries,
      });
      return await cloudwatchClient.send(command);
    }
    return null;
  }

  encryptSecretAccessKey(secretAccessKey: string) {
    const encryptKey = this.configService.get('microservices.cloudwatch.encryptKey') as string;
    return CryptoJS.AES.encrypt(secretAccessKey, encryptKey).toString();
  }

  decryptSecretAccessKey(encryptedSecretAccessKey: string) {
    const encryptKey = this.configService.get('microservices.cloudwatch.encryptKey') as string;
    const bytes = CryptoJS.AES.decrypt(encryptedSecretAccessKey, encryptKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
