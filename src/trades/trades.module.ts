import { Module } from '@nestjs/common';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { TradesRepository } from './trades.repository';

@Module({
  controllers: [TradesController],
  providers: [TradesService, TradesRepository],
})
export class TradesModule {}
