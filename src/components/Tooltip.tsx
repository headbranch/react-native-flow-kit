import { useState } from 'react';
import type { TooltipProps } from '../types';
import autoPickSide from '../utils/tooltip/autoPickSide';
import resolveTooltipPosition from '../utils/tooltip/resolveTooltipPosition';
import { View } from 'react-native';

export default function Tooltip({ config, measure }: TooltipProps) {
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });

  const side = config.side ?? autoPickSide(measure);
  const gap = config.offset ?? 0;
  const position = resolveTooltipPosition(
    measure,
    side,
    gap,
    config.align ?? 'center',
    tooltipSize.height || undefined,
    tooltipSize.width || undefined
  );

  return (
    <View
      style={{ position: 'absolute', ...position }}
      pointerEvents="box-none"
      onLayout={(e) =>
        setTooltipSize({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }
    >
      {config.component}
    </View>
  );
}
