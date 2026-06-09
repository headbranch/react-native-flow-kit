import { useCreateFlow } from '../hooks/useCreateFlow';
import type { ProviderProps } from '../types';
import { FlowContext } from '../contexts/FlowContext';

export function FlowProvider<
  TData extends Record<string, unknown> = Record<string, unknown>,
>({ children, steps, ...options }: ProviderProps<TData>) {
  const flow = useCreateFlow<TData>({ ...options, steps });
  return <FlowContext.Provider value={flow}>{children}</FlowContext.Provider>;
}
