import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class ProjectQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  pageNumber?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  pageSize?: number = 10;
}