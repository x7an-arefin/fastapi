import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { UsersFacade } from '../data-access/users.facade';
import { UsersTableComponent } from './users-table.component';
import { UsersFormComponent } from './users-form.component';
import { UsersDetailComponent } from './users-detail.component';
import { DrawerComponent } from '@shared/ui/drawer/drawer.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { HlmButtonDirective } from '@shared/ui/button/hlm-button.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPlus } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UsersTableComponent, UsersFormComponent, UsersDetailComponent, DrawerComponent, ConfirmDialogComponent, PageHeaderComponent, HlmButtonDirective, NgIconComponent],
  viewProviders: [provideIcons({ heroPlus })],
})
export class UsersPageComponent implements OnInit {
  protected readonly facade = inject(UsersFacade);
  
  ngOnInit(): void {
    this.facade.loadAll();
  }
}
