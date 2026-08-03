import { Module } from 'honestjs';
import { TaskController } from './task.controller.js';
import { TaskService } from './task.service.js';
import { TaskRepository } from './task.repository.js';

/**
 * @author arefin
 * @description Feature module that registers the Task controller, service, and repository with the DI container
 */
@Module({
  controllers: [TaskController],
  services: [TaskService, TaskRepository],
})
export class TaskModule {}
