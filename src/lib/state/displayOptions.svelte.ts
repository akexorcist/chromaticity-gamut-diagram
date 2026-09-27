import type { DiagramState } from '../render/diagram';

// Defaults match the legacy app's checkbox `checked` attributes exactly:
// opt-legend checked, opt-axis checked, opt-grid unchecked.
export const displayOptions: DiagramState = $state({
  showLegend: true,
  showAxis: true,
  showGrid: false,
});
