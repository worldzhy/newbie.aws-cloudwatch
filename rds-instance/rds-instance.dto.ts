import {IsBooleanString, IsNotEmpty, IsOptional, IsUUID} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class ListRDSInstancesDto {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsUUID('4')
  projectId: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsBooleanString()
  onlyMonitored?: string;
}
