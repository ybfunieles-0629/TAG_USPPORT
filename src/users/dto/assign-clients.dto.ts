import { IsArray, IsString } from 'class-validator';

export class AssignClientsDto {
  @IsArray()
  @IsString({ each: true })
  clientsId: string[];
}