import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import type { Tasks } from '../data-access/models/tasks.model';

@Component({
  selector: 'app-tasks-detail',
  templateUrl: './tasks-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class TasksDetailComponent {
  readonly tasks = input.required<Tasks>();
}
