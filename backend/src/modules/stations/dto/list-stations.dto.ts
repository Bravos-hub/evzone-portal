import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class ListStationsDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsString()
  region?: string

  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  orgId?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number
}
