import { Component, ChangeDetectionStrategy, inject, input, output, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, type AbstractControl } from '@angular/forms';
import { HlmButtonDirective } from '@shared/ui/button/hlm-button.directive';
import { HlmInputDirective } from '@shared/ui/input/hlm-input.directive';
import type { Users } from '../data-access/models/users.model';
import type { NewUsers, UpdateUsers } from '../data-access/models/users-api.types';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, HlmButtonDirective, HlmInputDirective],
})
export class UsersFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  
  readonly title = input.required<string>();
  readonly initialValue = input<Users | null>(null);
  readonly isLoading = input(false);
  
  readonly formSubmit = output<any>();
  readonly cancel = output<void>();
  
  protected readonly form = this.fb.group({

    'email': ['', [
      Validators.required
    ]],

    'name': ['', [
      Validators.required
    ]],

    'role': ['', [
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
    this.formSubmit.emit(this.form.getRawValue() as NewUsers);
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
  
  protected hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control.touched);
  }
}
