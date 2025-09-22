import { Injectable, NotFoundException } from '@nestjs/common';
import { TradesRepository } from './trades.repository';

@Injectable()
export class TradesService {
  constructor(private repo: TradesRepository) {}

  async getAllTrades() {
    return await this.repo.getAllTrades();
  }

  async getTradesById(id: string) {
    const trade = await this.repo.getTradesById(id);

    if (!trade) {
      throw new NotFoundException();
    }

    return trade;
  }
}
