import { Component, ChangeDetectionStrategy, inject, input, output, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, type AbstractControl } from '@angular/forms';
import { HlmButtonDirective } from '@shared/ui/button/hlm-button.directive';
import { HlmInputDirective } from '@shared/ui/input/hlm-input.directive';
import type { Tasks } from '../data-access/models/tasks.model';
import type { NewTasks, UpdateTasks } from '../data-access/models/tasks-api.types';

@Component({
  selector: 'app-tasks-form',
  templateUrl: './tasks-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, HlmButtonDirective, HlmInputDirective],
})
export class TasksFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  
  readonly title = input.required<string>();
  readonly initialValue = input<Tasks | null>(null);
  readonly isLoading = input(false);
  
  readonly formSubmit = output<any>();
  readonly cancel = output<void>();
  
  protected readonly form = this.fb.group({

    'title': ['', [
      Validators.required
    ]],

    'description': ['', [
      
    ]],

    'status': ['', [
      Validators.required
    ]],

    'priority': ['', [
      Validators.required
    ]],

    'userId': ['', [
      Validators.required
    ]],

  });
  
  ngOnChanges(): void {
    const val = this.initialValue();
    if (val) this.form.patchValue(val as never);
    else this.form.reset();
  }
  
  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.formSubmit.emit(this.form.getRawValue() as NewTasks);
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
  
  protected hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control.touched);
  }
}
