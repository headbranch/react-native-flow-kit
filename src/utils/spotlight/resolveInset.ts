import type { SpotlightConfig } from '../../types';

export default function resolveInset(inset: SpotlightConfig['inset']): {
  x: number;
  y: number;
} {
  if (inset == null) return { x: 8, y: 8 };
  if (typeof inset === 'number') return { x: inset, y: inset };
  return { x: inset.x ?? 8, y: inset.y ?? 8 };
}
