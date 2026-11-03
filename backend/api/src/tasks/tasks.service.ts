import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import type { Task } from './task.model.js';

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    {
      id: 1,
      title: 'Learn Kubernetes',
      description: 'Understand Kubernetes fundamentals',
      status: 'in-progress',
    },
    {
      id: 2,
      title: 'Build Task Manager API',
      description: 'Create the backend using NestJS',
      status: 'todo',
    },
  ];

  private nextId = 3;

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: number): Task {
    const task = this.tasks.find((task) => task.id === id);

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return task;
  }

  create(createTaskDto: CreateTaskDto): Task {
    const newTask: Task = {
      id: this.nextId++,
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status,
    };

    this.tasks.push(newTask);

    return newTask;
  }

  update(id: number, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id);
    const updatedTask: Task = {
      id: task.id,
      title: updateTaskDto.title ?? task.title,
      description: updateTaskDto.description ?? task.description,
      status: updateTaskDto.status ?? task.status,
    };

    this.tasks = this.tasks.map((current) =>
      current.id === id ? updatedTask : current,
    );

    return updatedTask;
  }

  remove(id: number): Task {
    const task = this.findOne(id);

    this.tasks = this.tasks.filter((current) => current.id !== id);

    return task;
  }
}
