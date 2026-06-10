import { useCreateFlow } from '../hooks/useCreateFlow';
import type { ProviderProps } from '../types';
import { FlowContext, getFlowContext } from '../contexts/FlowContext';

// FlowProvider.tsx
export function FlowProvider<TData extends Record<string, unknown>>({
  children,
  steps,
  id,
  ...options
}: ProviderProps<TData>) {
  const flow = useCreateFlow<TData>({ ...options, steps });
  const Context = id ? getFlowContext(id) : FlowContext;
  return <Context.Provider value={flow}>{children}</Context.Provider>;
}
