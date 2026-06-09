import { isValidElement, type ReactNode } from 'react';
import { type TooltipConfig } from '../../types';

export default function normalizeTooltipToConfig(
  tooltip: TooltipConfig | ReactNode
): TooltipConfig | undefined {
  if (tooltip == null) return undefined;
  if (
    typeof tooltip === 'object' &&
    !isValidElement(tooltip) &&
    'component' in (tooltip as object)
  ) {
    return tooltip as TooltipConfig;
  }
  return { component: tooltip as ReactNode };
}
