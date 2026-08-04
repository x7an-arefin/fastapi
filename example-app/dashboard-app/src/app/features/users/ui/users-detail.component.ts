import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import type { Users } from '../data-access/models/users.model';

@Component({
  selector: 'app-users-detail',
  templateUrl: './users-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class UsersDetailComponent {
  readonly users = input.required<Users>();
}
