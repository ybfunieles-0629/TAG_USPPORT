import { PartialType } from '@nestjs/swagger';
import { CreateFinancingCostProfitDto } from './create-financing-cost-profit.dto';

export class UpdateFinancingCostProfitDto extends PartialType(CreateFinancingCostProfitDto) {}
