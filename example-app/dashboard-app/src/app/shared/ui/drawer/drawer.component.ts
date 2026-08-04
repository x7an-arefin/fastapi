import { Component, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIconComponent],
  viewProviders: [provideIcons({ heroXMark })],
})
export class DrawerComponent {
  readonly open = input(false);
  readonly position = input<'left' | 'right'>('right');
  readonly width = input('480px');
  readonly title = input('');
  readonly closed = output<void>();
  
  protected readonly isVisible = signal(false);
  protected readonly isAnimating = signal(false);
  
  constructor() {
    effect(() => {
      if (this.open()) {
        this.isVisible.set(true);
        requestAnimationFrame(() => this.isAnimating.set(true));
      } else {
        this.isAnimating.set(false);
        setTimeout(() => this.isVisible.set(false), 300);
      }
    });
  }
  
  close(): void {
    this.closed.emit();
  }
}
