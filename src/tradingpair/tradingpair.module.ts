import { Module } from '@nestjs/common';
import { TradingpairService } from './tradingpair.service';
import { TradingpairController } from './tradingpair.controller';
import { TradingPairRepository } from './tradingpair.repository';

@Module({
  controllers: [TradingpairController],
  providers: [TradingpairService, TradingPairRepository],
})
export class TradingpairModule {}
