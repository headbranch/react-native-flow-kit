import { createFlow } from '../hooks/createFlow';
import type { ProviderProps } from '../types';
import { FlowContext } from '../contexts/FlowContext';

export function FlowProvider<
  TData extends Record<string, unknown> = Record<string, unknown>,
>({ children, steps, ...options }: ProviderProps<TData>) {
  const flow = createFlow<TData>({ ...options, steps });
  return <FlowContext.Provider value={flow}>{children}</FlowContext.Provider>;
}
