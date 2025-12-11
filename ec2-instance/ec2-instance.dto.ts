import {IsBoolean, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {CommonListRequestDto} from '@framework/common.dto';

export class ListEC2InstancesRequestDto extends CommonListRequestDto {
  @ApiProperty({type: String, required: true})
  @IsString()
  @IsNotEmpty()
  awsAccountId: string;

  @ApiProperty({type: String, required: false})
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({type: Boolean, required: false})
  @IsOptional()
  @IsBoolean()
  isWatching?: boolean;
}

export class FetchEC2InstancesRequestDto extends CommonListRequestDto {
  @ApiProperty({type: String, required: true})
  @IsString()
  @IsNotEmpty()
  awsAccountId: string;
}
