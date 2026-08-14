import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet />
    <app-toast-container />
  `,
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
})
export class AppComponent {}
