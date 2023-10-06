import { PartialType } from '@nestjs/swagger';
import { CreateMarketDesignAreaDto } from './create-market-design-area.dto';

export class UpdateMarketDesignAreaDto extends PartialType(CreateMarketDesignAreaDto) {}
