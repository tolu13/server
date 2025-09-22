import { PartialType } from '@nestjs/mapped-types';
import { CreateTradingpairDto } from './create-tradingpair.dto';

export class UpdateTradingpairDto extends PartialType(CreateTradingpairDto) {}
