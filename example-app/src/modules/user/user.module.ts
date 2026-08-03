import { Module } from 'honestjs';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';

/**
 * @author arefin
 * @description Feature module that registers the User controller, service, and repository with the DI container
 */
@Module({
  controllers: [UserController],
  services: [UserService, UserRepository],
})
export class UserModule {}
