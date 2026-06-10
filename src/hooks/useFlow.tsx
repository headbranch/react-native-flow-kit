import { useContext } from 'react';
import type { UseFlowReturn } from '../types';
import { FlowContext, getFlowContext } from '../contexts/FlowContext';

export function useFlow<TData extends Record<string, unknown>>(
  id?: string
): UseFlowReturn<TData> {
  const ctx = useContext(
    id ? getFlowContext(id) : FlowContext
  ) as UseFlowReturn<TData> | null;
  if (!ctx) {
    throw new Error(
      `useFlow(${id ? `"${id}"` : ''}) must be called inside <Flow.Provider${id ? ` id="${id}"` : ''}>`
    );
  }
  return ctx;
}
