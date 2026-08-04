import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPencilSquare, heroTrash, heroEye } from '@ng-icons/heroicons/outline';
import { LoadingSkeletonComponent } from '@shared/ui/loading-skeleton/loading-skeleton.component';
import { HlmButtonDirective } from '../button/hlm-button.directive';

export interface TableColumn {
  field: string;
  label: string;
  sortable?: boolean;
  badge?: boolean;
  badgeColorMap?: Record<string, string>;
  pipe?: string;
  pipeArgs?: string;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIconComponent, LoadingSkeletonComponent, HlmButtonDirective],
  viewProviders: [provideIcons({ heroPencilSquare, heroTrash, heroEye })],
})
export class DataTableComponent {
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input<any[]>([]);
  readonly isLoading = input(false);
  readonly rowActions = input<string[]>(['view', 'edit', 'delete']);
  
  readonly viewClicked = output<string>();
  readonly editClicked = output<string>();
  readonly deleteClicked = output<string>();
  
  protected readonly String = String;
  
  protected getCellValue(row: any, field: string): unknown {
    return row[field];
  }
  
  protected getBadgeClass(column: TableColumn, value: string): string {
    const map = column.badgeColorMap ?? {};
    const color = map[value] ?? 'secondary';
    const colorMap: Record<string, string> = {
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      destructive: 'bg-red-500/20 text-red-400 border-red-500/30',
      secondary: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
    };
    return colorMap[color] ?? colorMap['secondary']!;
  }
}
