// =============================================================================
// Central Chart.js registration. Import once to enable every chart type.
// =============================================================================
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
Chart.defaults.font.family = "'Poppins', 'Inter', sans-serif";
Chart.defaults.color = '#5a6b7f';
Chart.defaults.borderColor = 'rgba(26, 35, 51, 0.08)';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(19, 27, 43, 0.92)';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 10;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
Chart.defaults.plugins.legend.labels.boxWidth = 8;

export { Chart };
