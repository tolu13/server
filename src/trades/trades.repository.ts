import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TradesRepository {
  constructor(private prisma: PrismaService) {}

  async getAllTrades() {
    return await this.prisma.trade.findMany();
  }

  async getTradesById(id: string) {
    const trade = await this.prisma.trade.findUnique({
      where: {
        id: id,
      },
    });

    if (!trade) {
      throw new NotFoundException('no trades found');
    }
    return trade;
  }
}
