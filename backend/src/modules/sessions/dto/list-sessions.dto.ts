import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class ListSessionsDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsString()
  stationId?: string

  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number
}
