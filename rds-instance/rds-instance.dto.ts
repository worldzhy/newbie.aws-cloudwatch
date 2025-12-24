import {ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsString, IsUUID} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class ListRDSInstancesDto {
  @ApiProperty()
  @IsUUID()
  awsAccountId: string;

  @ApiProperty()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsBoolean()
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
