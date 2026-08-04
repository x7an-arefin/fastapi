import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { HlmButtonDirective } from '@shared/ui/button/hlm-button.directive';
import { HlmInputDirective } from '@shared/ui/input/hlm-input.directive';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, HlmButtonDirective, HlmInputDirective],
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  protected readonly isSubmitting = signal(false);
  
  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  
  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    const { email, password } = this.form.getRawValue();
    await this.auth.signIn(email!, password!);
    this.isSubmitting.set(false);
  }
}
