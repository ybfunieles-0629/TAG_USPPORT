import { IsString, MinLength } from 'class-validator';

export class CreatePrivilegeDto {
  @IsString()
  @MinLength(3)
  name: string;
}
