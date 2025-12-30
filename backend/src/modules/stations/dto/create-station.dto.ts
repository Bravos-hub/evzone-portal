import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  code!: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsNotEmpty()
  region!: string

  @IsString()
  @IsNotEmpty()
  country!: string

  @IsString()
  @IsNotEmpty()
  orgId!: string

  @IsString()
  @IsNotEmpty()
  type!: string

  @IsString()
  @IsNotEmpty()
  status!: string

  @IsString()
  @IsNotEmpty()
  address!: string

  @IsOptional()
  lat?: number

  @IsOptional()
  lng?: number

  @IsOptional()
  @IsString()
  make?: string

  @IsOptional()
  @IsString()
  model?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  maxKw?: number
}
