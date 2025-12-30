import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreatePaymentIntentDto {
  @IsNumber()
  amount!: number

  @IsOptional()
  @IsString()
  currency?: string

  @IsOptional()
  @IsString()
  provider?: string
}
