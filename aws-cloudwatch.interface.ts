import {CloudwatchMetricRDSMetricName, CloudwatchMetricStatistics} from './aws-cloudwatch.enum';

export interface GetEC2InstancesCPUMetricParams {
  ec2InstanceRemoteIds: string[];
  region: string;
  startTime: Date;
  endTime: Date;
  period: number;
  statistics: CloudwatchMetricStatistics;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface GetRDSInstancesMetricParams {
  rdsInstanceRemoteIds: string[];
  metricName: CloudwatchMetricRDSMetricName;
  region: string;
  startTime: Date;
  endTime: Date;
  period: number;
  statistics: CloudwatchMetricStatistics;
  accessKeyId?: string;
  secretAccessKey?: string;
}
