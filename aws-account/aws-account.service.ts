import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {CreateAWSAccountDto, UpdateAWSAccountDto} from '@microservices/cloudwatch/aws-account/aws-account.dto';
import {CloudwatchService} from '@microservices/cloudwatch/cloudwatch.service';

@Injectable()
export class AWSAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudwatchService: CloudwatchService
  ) {}

  async getAWSAccount(awsAccountId: string) {
    const awsAccount = await this.prisma.awsAccount.findUnique({
      where: {
        id: awsAccountId,
      },
    });
    if (!awsAccount) {
      throw new HttpException('AWS account not found', HttpStatus.BAD_REQUEST);
    }
    return awsAccount;
  }

  async createAWSAccount(data: CreateAWSAccountDto) {
    const {accessKeyId} = data;

    let awsAccount = await this.prisma.awsAccount.findUnique({
      where: {
        accessKeyId,
      },
    });

    const newAWSAccount = await this.prisma.$transaction(async tx => {
      if (awsAccount) {
        // Delete first.
        await tx.awsAccount.delete({
          where: {
            id: awsAccount.id,
          },
        });
      }
      // Create aws account.
      const createdAWSAccount = await tx.awsAccount.create({
        data: {
          ...data,
          secretAccessKey: this.cloudwatchService.encryptSecretAccessKey(data.secretAccessKey),
        },
      });

      return createdAWSAccount;
    });

    return newAWSAccount;
  }

  async updateAWSAccount(awsAccountId: string, data: UpdateAWSAccountDto) {
    const awsAccount = await this.prisma.awsAccount.findUnique({
      where: {
        id: awsAccountId,
      },
    });
    if (!awsAccount) {
      throw new HttpException('AWS account not found, maybe you should create it first', HttpStatus.BAD_REQUEST);
    }

    // Update aws account.
    const updatedAWSAccount = await this.prisma.awsAccount.update({
      where: {
        id: awsAccountId,
      },
      data: {
        ...data,
        secretAccessKey: data.secretAccessKey
          ? this.cloudwatchService.encryptSecretAccessKey(data.secretAccessKey)
          : undefined,
      },
    });

    return updatedAWSAccount;
  }
}
