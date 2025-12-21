import {Body, Controller, Get, Param, Patch, Post} from '@nestjs/common';
import {CreateAWSAccountDto, UpdateAWSAccountDto} from '@microservices/cloudwatch/aws-account/aws-account.dto';
import {PrismaService} from '@framework/prisma/prisma.service';
import {CloudwatchService} from '../cloudwatch.service';

@Controller('awsAccounts')
export class AWSAccountController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudwatchService: CloudwatchService
  ) {}

  @Get(':id')
  async getAWSAccount(@Param('id') id: string) {
    return await this.prisma.awsAccount.findUnique({
      where: {id},
    });
  }

  @Post()
  async createAWSAccount(@Body() body: CreateAWSAccountDto) {
    const {secretAccessKey, ...rest} = body;

    return await this.prisma.awsAccount.create({
      data: {
        ...rest,
        secretAccessKey: this.cloudwatchService.encryptSecretAccessKey(secretAccessKey),
      },
    });
  }

  @Patch(':id')
  async updateAWSAccount(@Param('id') id: string, @Body() body: UpdateAWSAccountDto) {
    const {secretAccessKey, ...rest} = body;

    return await this.prisma.awsAccount.update({
      where: {id},
      data: {
        ...rest,
        secretAccessKey: secretAccessKey ? this.cloudwatchService.encryptSecretAccessKey(secretAccessKey) : undefined,
      },
    });
  }
}
