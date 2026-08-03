import { Module } from 'honestjs';

import { UserModule } from '@modules/user/user.module.js';

import { TaskModule } from '@modules/task/task.module.js';


/**
 * @author arefin
 * @description Root application module that imports all generated feature modules
 */
@Module({
  imports: [UserModule, TaskModule],
})
export class AppModule {}
