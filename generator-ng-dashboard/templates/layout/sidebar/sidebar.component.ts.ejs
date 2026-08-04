import { Component, ChangeDetectionStrategy, signal, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import * as heroIcons from '@ng-icons/heroicons/outline';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent],
  viewProviders: [provideIcons(heroIcons)],
})
export class SidebarComponent {
  readonly navItems = input.required<NavItem[]>();
  protected readonly isCollapsed = signal(false);
  toggle(): void { this.isCollapsed.update(v => !v); }
}
