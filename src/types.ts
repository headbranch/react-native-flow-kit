import type React from 'react';
import type { Ref, ReactNode, RefObject } from 'react';
import type {
  ColorValue,
  ScrollView,
  ScrollViewProps,
  View,
} from 'react-native';

// ─── Element rect ─────────────────────────────────────────────────────────────
export interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FlowStatus = 'idle' | 'active' | 'finished';

// ─── Target ─────────────────────────────────────────────────────────────

export interface TargetProps {
  /** The ID of the Flow.Provider this target belongs to.
   * Only required when multiple providers are in use.
   * */
  provider?: string;
  /** The step ID this target belongs to. Must match a step defined in the parent Flow.Provider. */
  step: string;
  /** The single element to highlight and/or scroll to. Must support refs — use a host component or a custom component wrapped in forwardRef (React < 19) or one that accepts ref as a prop (React 19+). */
  children: ReactNode;
  /** Dims everything except this element when its step is active. Pass true for defaults or a `SpotlightConfig` for customization. */
  spotlight?: boolean | SpotlightConfig;
  /** Renders a tooltip adjacent to this element when its step is active. Pass a ReactNode for defaults or a TooltipConfig for positioning control. */
  tooltip?: ReactNode | TooltipConfig;
  /** Called when the user taps the overlay area outside the component. Only fires when spotlight or tooltip is configured. */
  onOverlayPress?: () => void;
  /** Called when this element's step becomes active. */
  onActive?: () => void;
}

// ─── Spotlight ─────────────────────────────────────────────────────────────

export interface SpotlightConfig {
  /** Extra space around the highlighted element in points. Accepts a single number for uniform inset, or per-axis values with x and y. Defaults to 8. */
  inset?: number | { x?: number; y?: number };
  /** Background color of the dimmed overlay.
   *
   * @default #000
   */
  color?: ColorValue;
  /** Opacity of the dimmed overlay. Between 0 and 1.
   *
   * @default 0.5
   * */
  opacity?: number;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';

/** Config object accepted by the `tooltip` prop on Step. */
export interface TooltipConfig {
  /** The content to render inside the tooltip. */
  component: ReactNode;
  /**
   * Which side of the highlighted element to place the tooltip on.
   * When omitted, the side with the most available screen space is chosen automatically.
   */
  side?: TooltipSide;
  /**
   * Alignment of the tooltip along the axis of the chosen side.
   * @default 'center'
   */
  align?: TooltipAlign;
  /**
   * Extra gap in points between the element edge and the tooltip.
   * Can be negative to pull the tooltip closer.
   * @default 8
   */
  offset?: number;
}
export interface TooltipProps {
  config: TooltipConfig;
  measure: ElementRect;
}

// ─── Flow ───────────────────────────────────────────────────────────────

export interface FlowOptions<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  steps: string[];
  initialData?: TData;
  /**
   * When true, the flow starts immediately on mount.
   * When false, the flow is dormant until `start()` is called.
   * @default false
   */
  autoStart?: boolean;
  /**
   * Called once when the flow starts.
   * Receives the initial flow data.
   */
  onStart?: (data: TData) => void | Promise<void>;
  /**
   * Called once when the flow finishes.
   * Receives the final flow data.
   */
  onFinish?: (data: TData) => void | Promise<void>;
  /**
   * Called whenever the current step changes.
   */
  onStepChange?: (from: StepRef, to: StepRef) => void;
}

export interface UseFlowReturn<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Ordered list of step IDs as defined in the provider. */
  steps: string[];
  /** Current status of the flow. */
  status: FlowStatus;
  /** Starts the flow. No-op if already active. */
  start: () => void;
  /** ID of the current step, or null when the flow is idle or finished. */
  currentStep: string | null;
  /** Zero-based index of the current step, or null when the flow is idle or finished. */
  currentIndex: number | null;
  /** Advances to the next step. Finishes the flow when called on the last step. */
  next: () => void;
  /** Returns to the previous step. No-op if already on the first step. */
  back: () => void;
  /**
   * Navigates directly to a step by ID.
   * If the same step ID appears multiple times in the sequence, the first occurrence is used.
   */
  goTo: (stepId: string) => void;
  /**
   * Ends the flow and triggers the `onFinish` callback.
   */
  finish: () => Promise<void>;
  /** Resets all state and returns the flow to idle. */
  reset: () => void;
  /** Arbitrary data accumulated during the flow. Typed via the TData generic. */
  data: TData;
  /**
   * Merges a patch into the flow data. Accepts either a partial object or an updater function.
   * @example updateData({ name: 'Alice' })
   * @example updateData(prev => ({ count: prev.count + 1 }))
   */
  updateData: (
    patch: Partial<TData> | ((prev: TData) => Partial<TData>)
  ) => void;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export type ProviderProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> = Omit<FlowOptions<TData>, 'steps'> & {
  /** Unique identifier for this flow. Only required when multiple Flow.Provider components are in use. */
  id?: string;
  /** Ordered list of step IDs that define the flow sequence. */
  steps: string[];
  children: ReactNode;
};

// ─── Step ─────────────────────────────────────────────────────────────────────

export type StepRef = { id: string; index: number };

// ─── Scroll ─────────────────────────────────────────────────────────────────────
export interface ScrollContextValue {
  scrollRef: RefObject<ScrollViewRef | null>;
  scrollTo: (getTargetY: (currentOffset: number) => number) => Promise<void>;
  horizontal: boolean | undefined;
}

export type ScrollViewRef = React.ComponentRef<typeof ScrollView>;
export type FlowScrollViewProps = ScrollViewProps & {
  children?: React.ReactNode;
  ref?: Ref<ScrollViewRef>;
};
export type ViewRef = React.ComponentRef<typeof View>;

// ─── Gate ─────────────────────────────────────────────────────────────────────

type WhenRange = {
  /** The step ID to start showing from. When omitted, shows from the beginning of the flow. */
  from?: string;
  /** The step ID to stop showing at, inclusive. When omitted, shows until the end of the flow. */
  until?: string;
  /** Step ID(s) to exclude from the range. */
  exclude?: string | string[];
};

export type GateProps = {
  children: React.ReactNode;
  /** The ID of the Flow.Provider this gate belongs to. Only required when multiple providers are in use. */
  provider?: string;
  /**
   * Controls when the gate is visible during an active flow.
   * Accepts a single step ID, an array of step IDs, or a WhenRange for contiguous ranges with optional exclusions.
   * Has no effect when `showWhenActive` is false.
   */
  when?: string | string[] | WhenRange;
  /**
   * Show when the flow has not yet started.
   * @default false
   */
  showWhenIdle?: boolean;
  /**
   * Show during any active step, regardless of which step is current.
   * When `when` is specified, visibility is narrowed to only the steps it defines.
   * @default true
   */
  showWhenActive?: boolean;
  /**
   * Show after the flow has finished.
   * @default false
   */
  showWhenFinished?: boolean;
};
