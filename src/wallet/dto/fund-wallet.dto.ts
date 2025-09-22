import { IsNumber } from 'class-validator';

export class FundWalletDto {
  @IsNumber()
  balance!: number;
}
