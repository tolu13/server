import { Module } from '@nestjs/common';
import { CandlesService } from './candles.service';
import { CandlesController } from './candles.controller';

@Module({
  controllers: [CandlesController],
  providers: [CandlesService],
  exports: [CandlesService], // Export CandlesService for use in other modules
})
export class CandlesModule {}
