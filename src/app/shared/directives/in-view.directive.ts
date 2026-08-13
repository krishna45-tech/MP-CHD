// =============================================================================
// Emits once when the element scrolls into the viewport.
// =============================================================================
import { Directive, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appInView]',
  standalone: true,
})
export class InViewDirective implements OnInit, OnDestroy {
  @Output() readonly appInView = new EventEmitter<void>();

  private readonly element = inject(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.appInView.emit();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
