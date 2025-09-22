import { IsString } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  symbol!: string;

  @IsString()
  name!: string;
}
