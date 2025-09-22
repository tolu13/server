import { IsString } from 'class-validator';

export class CreateTradingpairDto {
  @IsString()
  baseAssetId!: string;

  @IsString()
  quoteAssetId!: string;

  @IsString()
  symbol!: string;
}
