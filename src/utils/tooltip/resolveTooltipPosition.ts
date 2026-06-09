import { Dimensions } from 'react-native';
import type { ElementRect, TooltipAlign, TooltipSide } from '../../types';

export default function resolveTooltipPosition(
  measure: ElementRect,
  side: TooltipSide,
  gap: number,
  align: TooltipAlign = 'start',
  tooltipHeight?: number,
  tooltipWidth?: number
): { top?: number; bottom?: number; left?: number; right?: number } {
  const { x, y, width, height } = measure;
  const { width: sw } = Dimensions.get('window');

  const horizontalAlign = (): Pick<
    ReturnType<typeof resolveTooltipPosition>,
    'left' | 'right'
  > => {
    switch (align) {
      case 'start':
        return { left: x };
      case 'end':
        return { right: sw - (x + width) };
      case 'center':
        return { left: x + width / 2 - (tooltipWidth ?? 0) / 2 };
    }
  };

  const verticalAlign = (): Pick<
    ReturnType<typeof resolveTooltipPosition>,
    'top' | 'bottom'
  > => {
    switch (align) {
      case 'start':
        return { top: y };
      case 'end':
        return { bottom: sw - (y + height) }; // sw here should be screen height
      case 'center':
        return { top: y + height / 2 - (tooltipHeight ?? 0) / 2 };
    }
  };

  switch (side) {
    case 'bottom':
      return { top: y + height + gap, ...horizontalAlign() };
    case 'top':
      return { top: y - gap - (tooltipHeight ?? 0), ...horizontalAlign() };
    case 'right':
      return { left: x + width + gap, ...verticalAlign() };
    case 'left':
      return { right: sw - x + gap, ...verticalAlign() };
  }
}
