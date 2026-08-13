// =============================================================================
// Initials avatar with deterministic color from name.
// =============================================================================
import { Component, Input } from '@angular/core';

const AVATAR_COLORS = ['#E53935', '#1565C0', '#43A047', '#7B1FA2', '#F9A825', '#00897B', '#D81B60', '#546E7A'];

@Component({
  selector: 'app-avatar',
  template: `
    <div
      class="avatar"
      [style.width.px]="size"
      [style.height.px]="size"
      [style.background]="bgColor"
      [style.--av]="bgColor"
      [title]="name"
    >
      <span [style.fontSize.px]="size * 0.4">{{ initials }}</span>
    </div>
  `,
  styles: [
    `
      .avatar {
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 600;
        letter-spacing: 0.02em;
        user-select: none;
        flex-shrink: 0;
        box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--av) 60%, transparent),
          inset 0 0 0 1px rgba(255, 255, 255, 0.22);
      }
    `,
  ],
  standalone: true,
})
export class AvatarComponent {
  @Input() name = '';
  @Input() color?: string;
  @Input() size = 40;

  get initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  get bgColor(): string {
    if (this.color) return this.color;
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = (hash * 31 + this.name.charCodeAt(i)) % 997;
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }
}
