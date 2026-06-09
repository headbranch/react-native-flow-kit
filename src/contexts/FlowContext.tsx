// ─── Flow context ────────────────────────────────────────────────────

import { createContext, useContext } from 'react';
import type { UseFlowReturn } from '../types';

export const FlowContext = createContext<UseFlowReturn<any> | null>(null);

export function useFlowContext(componentName: string) {
  const ctx = useContext(FlowContext);
  if (!ctx) {
    throw new Error(`<Flow.${componentName}> must be inside <Flow.Provider>`);
  }
  return ctx;
}
