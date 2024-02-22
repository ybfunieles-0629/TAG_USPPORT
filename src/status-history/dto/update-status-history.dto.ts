import { PartialType } from '@nestjs/swagger';
import { CreateStatusHistoryDto } from './create-status-history.dto';

export class UpdateStatusHistoryDto extends PartialType(CreateStatusHistoryDto) {}
