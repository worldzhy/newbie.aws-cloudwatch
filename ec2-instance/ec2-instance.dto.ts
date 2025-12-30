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
import {CloudwatchMetricStatistics} from '../aws-cloudwatch.enum';
import {Transform} from 'class-transformer';
import {BooleanTransformer} from '@framework/transformers/boolean.transformer';

export class ListEC2InstancesDto {
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

export class FetchEC2InstancesDto {
  @ApiProperty()
  @IsUUID()
  awsAccountId: string;
}

export class SyncEC2InstancesWatchDto {
  @ApiProperty({type: String})
  @IsUUID()
  awsAccountId: string;

  @ApiProperty({type: [String], minLength: 0})
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(0)
  @IsUUID('4', {each: true})
  watchEC2InstanceIds: string[];

  @ApiProperty({type: [String], minLength: 0})
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(0)
  @IsUUID('4', {each: true})
  unwatchEC2InstanceIds: string[];
}

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

  @ApiProperty({type: Number, description: 'The period must be a multiple of 60'})
  @IsNumber()
  period: number;

  @ApiProperty({enum: CloudwatchMetricStatistics})
  @IsNotEmpty()
  @IsEnum(CloudwatchMetricStatistics)
  statistics: CloudwatchMetricStatistics;
}
