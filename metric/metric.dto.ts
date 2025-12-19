import {IsEnum, IsNotEmpty, IsNumberString, IsUUID} from 'class-validator';
import {CloudwatchMetricRDSMetricName, CloudwatchMetricStatistics} from '@microservices/cloudwatch/cloudwatch.enum';
import {ApiProperty} from '@nestjs/swagger';

export class GetWatchedEC2InstancesCPUMetricDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  awsAccountId: string;

  @ApiProperty()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    description: 'Multiples of 60, in seconds',
  })
  @IsNotEmpty()
  @IsNumberString()
  period: string;

  @ApiProperty({
    enum: CloudwatchMetricStatistics,
  })
  @IsNotEmpty()
  @IsEnum(CloudwatchMetricStatistics)
  statistics: CloudwatchMetricStatistics;
}

export class GetWatchedRDSInstancesMetricDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  awsAccountId: string;

  @ApiProperty({
    enum: CloudwatchMetricRDSMetricName,
  })
  @IsNotEmpty()
  @IsEnum(CloudwatchMetricRDSMetricName)
  metricName: CloudwatchMetricRDSMetricName;

  @ApiProperty()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    description: 'Multiples of 60, in seconds',
  })
  @IsNotEmpty()
  @IsNumberString()
  period: string;

  @ApiProperty({
    enum: CloudwatchMetricStatistics,
  })
  @IsNotEmpty()
  @IsEnum(CloudwatchMetricStatistics)
  statistics: CloudwatchMetricStatistics;
}
