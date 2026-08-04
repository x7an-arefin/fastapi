import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DataTableComponent, type TableColumn } from '@shared/ui/data-table/data-table.component';
import type { Users } from '../data-access/models/users.model';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent],
})
export class UsersTableComponent {
  readonly rows = input<Users[]>([]);
  readonly isLoading = input(false);
  
  readonly viewClicked = output<string>();
  readonly editClicked = output<string>();
  readonly deleteClicked = output<string>();

  protected readonly columns: TableColumn[] = [

  ];
}
