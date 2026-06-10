// Gate.tsx
import { useFlowContext } from '../contexts/FlowContext';
import type { GateProps } from '../types';

function resolveVisibleIndices(
  when: GateProps['when'],
  steps: string[]
): Set<number> {
  if (when == null) {
    return new Set(steps.map((_, i) => i));
  }

  let indices: Set<number>;

  if (typeof when === 'string') {
    if (__DEV__ && !steps.includes(when)) {
      console.warn(`[Flow.Gate] "when" step "${when}" not found in steps.`);
    }
    indices = new Set([steps.indexOf(when)]);
  } else if (Array.isArray(when)) {
    if (__DEV__) {
      when.forEach((s) => {
        if (!steps.includes(s))
          console.warn(`[Flow.Gate] "when" step "${s}" not found in steps.`);
      });
    }
    indices = new Set(when.map((s) => steps.indexOf(s)));
  } else {
    const { from, until, exclude } = when;
    const fromIndex = from != null ? steps.indexOf(from) : 0;
    const untilIndex = until != null ? steps.indexOf(until) : steps.length - 1;
    if (__DEV__) {
      if (from != null && fromIndex === -1)
        console.warn(
          `[Flow.Gate] "when.from" step "${from}" not found in steps.`
        );
      if (until != null && untilIndex === -1)
        console.warn(
          `[Flow.Gate] "when.until" step "${until}" not found in steps.`
        );
    }
    indices = new Set(
      Array.from(
        { length: untilIndex - fromIndex + 1 },
        (_, i) => fromIndex + i
      )
    );
    if (exclude != null) {
      const excludeArr = Array.isArray(exclude) ? exclude : [exclude];
      if (__DEV__) {
        excludeArr.forEach((s) => {
          if (!steps.includes(s))
            console.warn(
              `[Flow.Gate] "when.exclude" step "${s}" not found in steps.`
            );
        });
      }
      excludeArr.forEach((s) => indices.delete(steps.indexOf(s)));
    }
  }

  return indices;
}

export function Gate({
  children,
  when,
  showWhenIdle = false,
  showWhenActive = true,
  showWhenFinished = false,
}: GateProps) {
  const { currentStep, status, steps } = useFlowContext('Gate');

  if (status === 'idle') return showWhenIdle ? children : null;
  if (status === 'finished') return showWhenFinished ? children : null;
  if (!showWhenActive) return null;

  const currentIndex = steps.indexOf(currentStep!);
  const visibleIndices = resolveVisibleIndices(when, steps);

  return visibleIndices.has(currentIndex) ? children : null;
}
