import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class UpdateStationDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  lat?: number

  @IsOptional()
  lng?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  maxKw?: number
}
