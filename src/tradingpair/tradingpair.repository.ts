import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTradingpairDto } from './dto/create-tradingpair.dto';

@Injectable()
export class TradingPairRepository {
  constructor(private prisma: PrismaService) {}

  async postTradinPairs(createdto: CreateTradingpairDto) {
    const tp = await this.prisma.tradingPair.create({
      data: {
        baseAssetId: createdto.baseAssetId,
        quoteAssetId: createdto.quoteAssetId,
        symbol: createdto.symbol,
      },
    });
    return tp;
  }

  async findAll() {
    return await this.prisma.tradingPair.findMany();
  }

  async getAssetById(id: string) {
    const tp = await this.prisma.tradingPair.findFirst({
      where: {
        id,
      },
    });
    return tp;
  }
}
