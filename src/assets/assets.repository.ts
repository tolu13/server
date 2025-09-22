import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AssetsRepository {
  constructor(private prisma: PrismaService) {}

  async postAsset(createdto: CreateAssetDto) {
    const asset = await this.prisma.asset.create({
      data: {
        symbol: createdto.symbol,
        name: createdto.name,
      },
    });
    return asset;
  }

  async findAll() {
    return await this.prisma.asset.findMany();
  }

  async getAssetById(id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: {
        id,
      },
    });
    return asset;
  }
}
