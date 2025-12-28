import { Type, Transform } from 'class-transformer';
import { IsOptional, IsPositive, Min, IsString, IsUUID, IsArray } from 'class-validator';

export class TaskQueryDto {
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

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  @IsArray()
  @IsString({ each: true })
  priority?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  @IsArray()
  @IsString({ each: true })
  assignedTo?: string[];

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}