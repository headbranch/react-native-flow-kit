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
  /** The step ID this target belongs to. */
  step: string;
  /** The single element to highlight. Must accept a ref. */
  children: ReactNode;
  spotlight?: boolean | SpotlightConfig;
  /** Config to render tooltip */
  tooltip?: ReactNode | TooltipConfig;
  /** Called when the user taps any of the darkened overlay (not the spotlit element). */
  onOverlayPress?: () => void;
  /** Called when the element goes into view. */
  onActive?: () => void;
}

// ─── Spotlight ─────────────────────────────────────────────────────────────

export interface SpotlightConfig {
  inset?: number | { x?: number; y?: number };
  color?: ColorValue;
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
   * Which side of the step to place the tooltip on.
   * When omitted, the side with the most available screen space is chosen.
   */
  side?: TooltipSide;
  align?: TooltipAlign; // defaults to 'start'
  /**
   * Extra gap (in px) on top of the default spacing between the element edge and
   * the tooltip. Can be negative to pull the tooltip closer.
   * @default 0
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
  steps: string[];
  status: FlowStatus;
  /** Starts the flow. No-op if already active. */
  start: () => void;
  /** ID of the current step. */
  currentStep: string | null;
  /** Index of the current step within the flow sequence. */
  currentIndex: number | null;
  /** Move to next step. Will finish the flow when at the last step. */
  next: () => void;
  /** Move to previous step. */
  back: () => void;
  /**
   * Navigate to a step by ID.
   * If the sequence contains the same step ID multiple times,
   * the first occurrence is used.
   */
  goTo: (stepId: string) => void;
  /**
   * Ends the flow and runs the `onFinish` callback.
   */
  finish: () => Promise<void>;
  /** Resets all state and returns the flow to dormant (inactive). */
  reset: () => void;
  /** User-specified data from the flow. Useful for cases where you don't want to manage a separate state for onboarding, etc. */
  data: TData;
  /** Update user-defined flow data. */
  updateData: (
    patch: Partial<TData> | ((prev: TData) => Partial<TData>)
  ) => void;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export type ProviderProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> = Omit<FlowOptions<TData>, 'steps'> & {
  /**
   * Explicit step order by id.
   */
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
  from?: string;
  until?: string;
  exclude?: string | string[];
};

export type GateProps = {
  children: React.ReactNode;
  /**
   * Show only during specific step(s) or a range.
   */
  when?: string | string[] | WhenRange;
  /**
   * Show when the flow has not started.
   * @default false
   */
  showWhenIdle?: boolean;
  /**
   * Show whenever the flow is active (any step).
   * @default true
   */
  showWhenActive?: boolean;
  /**
   * Show after the flow finishes.
   * @default false
   */
  showWhenFinished?: boolean;
};
