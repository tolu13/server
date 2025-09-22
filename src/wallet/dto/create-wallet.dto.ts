import { IsNumber, IsString } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  assetId!: string;
  @IsNumber()
  balance!: number;
}
