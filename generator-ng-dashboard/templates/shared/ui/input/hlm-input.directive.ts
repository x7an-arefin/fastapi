import { Directive, input, computed } from '@angular/core';
import { hlm } from '../../utils/hlm';

const baseInputClass = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

@Directive({
  selector: '[hlmInput]',
  standalone: true,
  host: {
    '[class]': 'computedClass()',
  },
})
export class HlmInputDirective {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly computedClass = computed(() => {
    return hlm(baseInputClass, this.userClass());
  });
}
