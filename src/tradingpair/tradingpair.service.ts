import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTradingpairDto } from './dto/create-tradingpair.dto';
import { TradingPairRepository } from './tradingpair.repository';

@Injectable()
export class TradingpairService {
  constructor(private repo: TradingPairRepository) {}
  async create(createTradingpairDto: CreateTradingpairDto) {
    return await this.repo.postTradinPairs(createTradingpairDto);
  }

  async findAll() {
    return await this.repo.findAll();
  }

  async findOne(id: string) {
    const tp = await this.repo.getAssetById(id);
    if (!tp) {
      throw new NotFoundException('Asset not found');
    }
    return tp;
  }
}
