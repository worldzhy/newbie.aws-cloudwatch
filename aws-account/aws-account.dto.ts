import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, ValidateIf} from 'class-validator';
import {AWSRegion} from '@microservices/aws-cloudwatch/aws-cloudwatch.enum';

export class CreateAWSAccountDto {
  @ApiProperty({type: String, required: true})
  @IsNotEmpty()
  @IsString()
  awsAccountId: string;

  @ApiProperty({type: String})
  @IsNotEmpty()
  @IsString()
  iamUserName: string;

  @ApiProperty({type: String})
  @IsNotEmpty()
  @IsString()
  accessKeyId: string;

  @ApiProperty({type: String})
  @IsNotEmpty()
  @IsString()
  secretAccessKey: string;

  @ApiProperty({
    type: [String],
    enum: AWSRegion,
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(AWSRegion, {each: true})
  regions: AWSRegion[];
}

export class UpdateAWSAccountDto {
  @ApiProperty({type: String, required: false})
  @IsNotEmpty()
  @IsString()
  awsAccountId?: string;

  @ApiPropertyOptional({type: String})
  @ValidateIf(o => o.iamUserName !== undefined)
  @IsString()
  iamUserName?: string;

  @ApiPropertyOptional({type: String})
  @ValidateIf(o => o.accessKeyId !== undefined)
  @IsString()
  accessKeyId?: string;

  @ApiPropertyOptional({type: String})
  @ValidateIf(o => o.secretAccessKey !== undefined)
  @IsString()
  secretAccessKey?: string;

  @ApiPropertyOptional({
    type: [String],
    enum: AWSRegion,
  })
  @ValidateIf(o => o.regions !== undefined)
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(AWSRegion, {each: true})
  regions?: AWSRegion[];
}
