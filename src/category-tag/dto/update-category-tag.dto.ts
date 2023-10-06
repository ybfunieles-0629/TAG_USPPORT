import { PartialType } from '@nestjs/swagger';
import { CreateCategoryTagDto } from './create-category-tag.dto';

export class UpdateCategoryTagDto extends PartialType(CreateCategoryTagDto) {}
