// =============================================================================
// 404 page – graceful fallback for unknown routes.
// =============================================================================
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
})
export class NotFoundComponent {}
