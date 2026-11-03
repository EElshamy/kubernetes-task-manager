import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { TaskStatus } from '../task.model.js';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(['todo', 'in-progress', 'completed'])
  status?: TaskStatus;
}
