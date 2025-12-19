import {ArrayMinSize, IsArray, IsBooleanString, IsNotEmpty, IsString, IsUUID, ValidateIf} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class ListRDSInstancesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  awsAccountId: string;

  @ApiProperty()
  @ValidateIf(o => o.status !== undefined)
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @ValidateIf(o => o.isWatching !== undefined)
  @IsBooleanString()
  isWatching?: string;
}

export class FetchRDSInstancesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  awsAccountId: string;
}

export class SyncRDSInstancesWatchDto {
  @ApiProperty({type: String})
  @IsNotEmpty()
  @IsUUID('4')
  awsAccountId: string;

  @ApiProperty({type: [String], minLength: 0})
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(0)
  @IsUUID('4', {each: true})
  watchRDSInstanceIds: string[];

  @ApiProperty({type: [String], minLength: 0})
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(0)
  @IsUUID('4', {each: true})
  unwatchRDSInstanceIds: string[];
}
