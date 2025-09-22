import { Test, TestingModule } from '@nestjs/testing';
import { TradingpairService } from './tradingpair.service';

describe('TradingpairService', () => {
  let service: TradingpairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TradingpairService],
    }).compile();

    service = module.get<TradingpairService>(TradingpairService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
