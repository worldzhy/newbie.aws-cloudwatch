import {Body, Controller, Get, Param, Patch, Post} from '@nestjs/common';
import {AWSAccountService} from '@microservices/cloudwatch/aws-account/aws-account.service';
import {CreateAWSAccountDto, UpdateAWSAccountDto} from '@microservices/cloudwatch/aws-account/aws-account.dto';

@Controller('awsAccounts')
export class AWSAccountController {
  constructor(private readonly awsAccountService: AWSAccountService) {}

  @Get(':awsAccountId')
  async getAWSAccount(@Param('awsAccountId') awsAccountId: string) {
    return await this.awsAccountService.getAWSAccount(awsAccountId);
  }

  @Post()
  async createAWSAccount(@Body() body: CreateAWSAccountDto) {
    return await this.awsAccountService.createAWSAccount(body);
  }

  @Patch(':awsAccountId')
  async updateAWSAccount(@Param('awsAccountId') awsAccountId: string, @Body() body: UpdateAWSAccountDto) {
    return await this.awsAccountService.updateAWSAccount(awsAccountId, body);
  }
}
