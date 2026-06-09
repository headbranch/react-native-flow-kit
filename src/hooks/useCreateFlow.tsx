import { useCallback, useEffect, useState } from 'react';
import type { FlowOptions, FlowStatus, UseFlowReturn } from '../types';

export function useCreateFlow<
  TData extends Record<string, unknown> = Record<string, unknown>,
>({
  steps,
  initialData = {} as TData,
  autoStart = false,
  onFinish,
  onStart,
  onStepChange,
}: FlowOptions<TData>): UseFlowReturn<TData> {
  const [status, setStatus] = useState<FlowStatus>(
    autoStart ? 'active' : 'idle'
  );
  const [currentIndexState, setCurrentIndex] = useState(0);
  const [data, setData] = useState<TData>(initialData);

  useEffect(() => {
    if (autoStart) {
      onStart?.(data);
    }
  }, [autoStart]);

  const isRunning = status === 'active';

  const currentStep = isRunning ? (steps[currentIndexState] ?? null) : null;
  const currentIndex: number | null = isRunning ? currentIndexState : null;
  const isFirstStep = currentIndexState === 0;
  const isLastStep = currentIndexState === steps.length - 1;

  const notifyChange = useCallback(
    (fromIdx: number, toIdx: number) => {
      const from = steps[fromIdx];
      const to = steps[toIdx];
      if (!from || !to) return;
      onStepChange?.({ id: from, index: fromIdx }, { id: to, index: toIdx });
    },
    [onStepChange, steps]
  );

  const start = useCallback(() => {
    if (status !== 'idle') return;
    setStatus('active');
    onStart?.(data);
  }, [status, onStart, data]);

  const goTo = useCallback(
    (stepId: string) => {
      const idx = steps.indexOf(stepId);
      if (idx === -1) {
        console.warn(`[useFlowState] Step "${stepId}" not found.`);
        return;
      }
      setCurrentIndex((prev) => {
        notifyChange(prev, idx);
        return idx;
      });
    },
    [steps, notifyChange]
  );

  const back = useCallback(() => {
    if (isFirstStep) return;
    setCurrentIndex((prev) => {
      const nextIdx = prev - 1;
      notifyChange(prev, nextIdx);
      return nextIdx;
    });
  }, [isFirstStep, notifyChange]);

  const finish = useCallback(async () => {
    if (status === 'finished') return;
    await onFinish?.(data);
    setStatus('finished');
  }, [status, onFinish, data]);

  const next = useCallback(() => {
    if (__DEV__ && !isRunning) {
      console.warn(
        '[Flow] next() called before flow has started. Call start() first.'
      );
    }
    if (isLastStep) {
      void finish();
      return;
    }
    setCurrentIndex((prev) => {
      const nextIdx = prev + 1;
      notifyChange(prev, nextIdx);
      return nextIdx;
    });
  }, [isLastStep, notifyChange, finish, isRunning]);

  const reset = useCallback(() => {
    setStatus('idle');
    setCurrentIndex(0);
    setData(initialData);
  }, [initialData]);

  const updateData = useCallback(
    (patchOrFn: Partial<TData> | ((prev: TData) => Partial<TData>)) => {
      setData((prev) => {
        const patch =
          typeof patchOrFn === 'function' ? patchOrFn(prev) : patchOrFn;
        return { ...prev, ...patch };
      });
    },
    []
  );

  return {
    steps,
    currentStep,
    currentIndex,
    status,
    start,
    next,
    back,
    goTo,
    finish,
    reset,
    data,
    updateData,
  };
}
