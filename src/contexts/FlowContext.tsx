// contexts/FlowContext.ts
import { createContext, useContext } from 'react';
import type { UseFlowReturn } from '../types';

const flowContextRegistry = new Map<
  string,
  React.Context<UseFlowReturn<any> | null>
>();

export function getFlowContext(id: string) {
  if (!flowContextRegistry.has(id)) {
    flowContextRegistry.set(id, createContext<UseFlowReturn<any> | null>(null));
  }
  return flowContextRegistry.get(id)!;
}

export const FlowContext = createContext<UseFlowReturn<any> | null>(null);

export function useFlowContext(componentName: string, id?: string) {
  const ctx = useContext(id ? getFlowContext(id) : FlowContext);
  if (!ctx) {
    throw new Error(
      `<Flow.${componentName}> must be inside <Flow.Provider${id ? ` id="${id}"` : ''}>`
    );
  }
  return ctx;
}
