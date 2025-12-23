import {Body, Controller, Get, Param, Patch, Post} from '@nestjs/common';
import {CreateAWSAccountDto, UpdateAWSAccountDto} from '@microservices/aws-cloudwatch/aws-account/aws-account.dto';
import {PrismaService} from '@framework/prisma/prisma.service';
import {encryptString} from '@framework/utilities/crypto.util';
import {ConfigService} from '@nestjs/config';

@Controller('awsAccounts')
export class AWSAccountController {
  private readonly encryptKey: string;
  private readonly encryptIV: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.encryptKey = this.configService.get('microservices.cloudwatch.cryptoEncryptKey') as string;
    this.encryptIV = this.configService.get('microservices.cloudwatch.cryptoEncryptIV') as string;
  }

  @Get(':id')
  async getAWSAccount(@Param('id') id: string) {
    const awsAccount = await this.prisma.awsAccount.findUniqueOrThrow({
      where: {id},
    });
    return awsAccount;
  }

  @Post()
  async createAWSAccount(@Body() body: CreateAWSAccountDto) {
    const {secretAccessKey, ...rest} = body;

    const newAWSAccount = await this.prisma.awsAccount.create({
      data: {
        ...rest,
        secretAccessKey: encryptString(secretAccessKey, this.encryptKey, this.encryptIV),
      },
    });

    return newAWSAccount;
  }

  @Patch(':id')
  async updateAWSAccount(@Param('id') id: string, @Body() body: UpdateAWSAccountDto) {
    const {secretAccessKey, ...rest} = body;

    const updatedAWSAccount = await this.prisma.awsAccount.update({
      where: {id},
      data: {
        ...rest,
        secretAccessKey: secretAccessKey ? encryptString(secretAccessKey, this.encryptKey, this.encryptIV) : undefined,
      },
    });

    return updatedAWSAccount;
  }
}
