import type { SpotlightConfig } from '../../types';

export default function resolveInset(inset: SpotlightConfig['inset']): {
  x: number;
  y: number;
} {
  if (inset == null) return { x: 0, y: 0 };
  if (typeof inset === 'number') return { x: inset, y: inset };
  return { x: inset.x ?? 0, y: inset.y ?? 0 };
}
