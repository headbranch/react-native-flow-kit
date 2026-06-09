import { FlowProvider } from './components/FlowProvider';
import { FlowScrollView } from './components/FlowScrollView';
import { Gate } from './components/FlowGate';
import { Target } from './components/FlowTarget';
import { useFlow } from './hooks/useFlow';

export const Flow = {
  Provider: FlowProvider,
  Target,
  Gate,
  ScrollView: FlowScrollView,
  useFlow: useFlow,
};

// Hooks
export { useFlow };

// Types
export type {
  ProviderProps,
  TargetProps,
  StepRef,
  SpotlightConfig,
  TooltipConfig,
  UseFlowReturn,
  GateProps,
  FlowStatus,
} from './types';
