import { PartialType } from '@nestjs/swagger';
import { CreateFinancingCostProfitDto } from './create-financing-cost-profit.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateFinancingCostProfitDto extends PartialType(CreateFinancingCostProfitDto) {
  @IsString()
  @IsUUID()
  id: string;
}
