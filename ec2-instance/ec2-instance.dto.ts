import {ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsString, IsUUID} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class ListEC2InstancesDto {
  @ApiProperty()
  @IsUUID()
  awsAccountId: string;

  @ApiPropertyOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsBoolean()
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
