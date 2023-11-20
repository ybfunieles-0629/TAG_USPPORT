import { IsDate, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePurchaseOrderDto {
  @IsOptional()
  @IsString()
  tagOrderNumber: string;

  @IsString()
  clientOrderNumber: string;

  @IsString()
  orderDocument: string;

  @IsDate()
  approvalDate: Date;

  @IsDate()
  creationDate: Date;

  @IsDate()
  paymentDate: Date;

  @IsString()
  userApproval: string;

  @IsDate()
  invoiceIssueDate: Date;

  @IsDate()
  invoiceDueDate: Date;

  @IsInt()
  @Min(0)
  financingCost: number;

  @IsInt()
  @Min(0)
  feeCost: number;

  @IsInt()
  @Min(0)
  retentionCost: number;

  @IsString()
  billingNumber: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;

  @IsString()
  commercialQualification: string;

  @IsString()
  state: string;
}
