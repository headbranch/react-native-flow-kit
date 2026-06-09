import { useContext } from 'react';
import type { UseFlowReturn } from '../types';
import { FlowContext } from '../contexts/FlowContext';

export function useFlow<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(): UseFlowReturn<TData> {
  const ctx = useContext(FlowContext) as UseFlowReturn<TData> | null;
  if (!ctx) {
    throw new Error('useFlow() must be called inside <Flow.Provider>');
  }
  return ctx;
}
