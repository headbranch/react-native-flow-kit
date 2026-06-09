import { Dimensions } from 'react-native';
import { type ElementRect, type TooltipSide } from '../../types';

export default function autoPickSide(measure: ElementRect): TooltipSide {
  const { x, y, width, height } = measure;
  const { width: sw, height: sh } = Dimensions.get('window');

  const space: Record<TooltipSide, number> = {
    top: y,
    bottom: sh - (y + height),
    left: x,
    right: sw - (x + width),
  };

  return (Object.keys(space) as TooltipSide[]).reduce((best, s) =>
    space[s] > space[best] ? s : best
  );
}
