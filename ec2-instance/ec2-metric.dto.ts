import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsUUID,
} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {CloudwatchMetricStatistics} from '../aws-cloudwatch.enum';

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

  @ApiProperty({description: 'The period must be a multiple of 60'})
  @IsNumberString()
  period: string;

  @ApiProperty({enum: CloudwatchMetricStatistics})
  @IsNotEmpty()
  @IsEnum(CloudwatchMetricStatistics)
  statistics: CloudwatchMetricStatistics;
}
