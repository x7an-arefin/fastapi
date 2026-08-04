import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { TasksFacade } from '../data-access/tasks.facade';
import { TasksTableComponent } from './tasks-table.component';
import { TasksFormComponent } from './tasks-form.component';
import { TasksDetailComponent } from './tasks-detail.component';
import { DrawerComponent } from '@shared/ui/drawer/drawer.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { HlmButtonDirective } from '@shared/ui/button/hlm-button.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPlus } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-tasks-page',
  templateUrl: './tasks-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TasksTableComponent, TasksFormComponent, TasksDetailComponent, DrawerComponent, ConfirmDialogComponent, PageHeaderComponent, HlmButtonDirective, NgIconComponent],
  viewProviders: [provideIcons({ heroPlus })],
})
export class TasksPageComponent implements OnInit {
  protected readonly facade = inject(TasksFacade);
  
  ngOnInit(): void {
    this.facade.loadAll();
  }
}
