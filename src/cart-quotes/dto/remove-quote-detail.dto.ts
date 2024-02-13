import { IsArray, IsString } from 'class-validator';

export class RemoveQuoteDetailDto {
  @IsArray()
  @IsString({ each: true })
  quoteDetails: string[];
};