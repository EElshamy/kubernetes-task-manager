import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import type { TaskStatus } from '../task.model.js';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsIn(['todo', 'in-progress', 'completed'])
  status: TaskStatus;
}
