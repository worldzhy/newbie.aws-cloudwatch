import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {CloudwatchMetricRDSMetricName, CloudwatchMetricStatistics} from '../aws-cloudwatch.enum';
import {Transform} from 'class-transformer';
import {BooleanTransformer} from '@framework/transformers/boolean.transformer';

export class ListRDSInstancesDto {
  @ApiProperty()
  @IsUUID()
  awsAccountId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(BooleanTransformer)
  isWatching?: boolean;
}

export class FetchRDSInstancesDto {
  @ApiProperty()
  @IsUUID()
  awsAccountId: string;
}

export class SyncRDSInstancesWatchDto {
  @ApiProperty({type: String})
  @IsUUID()
  awsAccountId: string;

  @ApiProperty({type: [String], minLength: 0})
  @IsArray()
  @ArrayMinSize(0)
  @IsUUID('4', {each: true})
  watchRDSInstanceIds: string[];

  @ApiProperty({type: [String], minLength: 0})
  @IsArray()
  @ArrayMinSize(0)
  @IsUUID('4', {each: true})
  unwatchRDSInstanceIds: string[];
}

export class GetWatchedRDSInstancesMetricDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  awsAccountId: string;

  @ApiProperty({enum: CloudwatchMetricRDSMetricName})
  @IsNotEmpty()
  @IsEnum(CloudwatchMetricRDSMetricName)
  metricName: CloudwatchMetricRDSMetricName;

  @ApiProperty()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({type: Number, description: 'The period must be a multiple of 60'})
  @IsNumber()
  period: number;

  @ApiProperty({enum: CloudwatchMetricStatistics})
  @IsNotEmpty()
  @IsEnum(CloudwatchMetricStatistics)
  statistics: CloudwatchMetricStatistics;
}
