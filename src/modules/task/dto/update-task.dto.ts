import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { TaskStatus, TaskPriority } from 'src/common/enums/task.enum';

export class UpdateTaskDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsOptional()
  @IsUUID()
  assignedTo?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}