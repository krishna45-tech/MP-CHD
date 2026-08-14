// =============================================================================
// Risk level utilities – maps RiskLevel to human labels and CSS classes.
// =============================================================================
import { Pipe, PipeTransform } from '@angular/core';
import type { RiskLevel } from '../../core/models/common.model';

export const RISK_META: Record<RiskLevel, { label: string; cssClass: string }> = {
  low: { label: 'Low Risk', cssClass: 'badge-low' },
  medium: { label: 'Medium Risk', cssClass: 'badge-medium' },
  high: { label: 'High Risk', cssClass: 'badge-high' },
};

@Pipe({ name: 'riskLabel', standalone: true })
export class RiskLabelPipe implements PipeTransform {
  transform(level: RiskLevel | undefined): string {
    if (!level) return '';
    return RISK_META[level].label;
  }
}

@Pipe({ name: 'riskClass', standalone: true })
export class RiskClassPipe implements PipeTransform {
  transform(level: RiskLevel | undefined): string {
    if (!level) return '';
    return RISK_META[level].cssClass;
  }
}
