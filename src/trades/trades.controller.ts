import { Controller, Get, Param } from '@nestjs/common';
import { TradesService } from './trades.service';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  getAlltrades() {
    return this.tradesService.getAllTrades();
  }

  @Get(':id')
  getTradesById(@Param('id') id: string) {
    return this.tradesService.getTradesById(id);
  }
}
