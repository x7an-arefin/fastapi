import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroDocumentMagnifyingGlass } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  standalone: true,
  imports: [NgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ heroDocumentMagnifyingGlass })]
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly iconName = input<string>('heroDocumentMagnifyingGlass');
}
