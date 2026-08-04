import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DataTableComponent, type TableColumn } from '@shared/ui/data-table/data-table.component';
import type { Tasks } from '../data-access/models/tasks.model';

@Component({
  selector: 'app-tasks-table',
  templateUrl: './tasks-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent],
})
export class TasksTableComponent {
  readonly rows = input<Tasks[]>([]);
  readonly isLoading = input(false);
  
  readonly viewClicked = output<string>();
  readonly editClicked = output<string>();
  readonly deleteClicked = output<string>();

  protected readonly columns: TableColumn[] = [

  ];
}
