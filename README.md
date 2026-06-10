# react-native-flow-kit

A composable library for building multi-step flows in React Native — onboarding tours, feature walkthroughs, guided checklists, and more. Supports spotlight highlighting, contextual tooltips, scroll-aware steps, and flexible sequencing.

---

## Installation

```sh
# npm
npm install react-native-flow-kit

# yarn
yarn add react-native-flow-kit
```

---

## Quick Start

```tsx
import { Flow, useFlow } from 'react-native-flow-kit';

export default function App() {
  return (
    <Flow.Provider steps={['welcome', 'profile', 'done']} autoStart>
      <MyScreen />
    </Flow.Provider>
  );
}

function MyScreen() {
  const { next, back, finish, currentStep } = useFlow();

  return (
    <>
      <Flow.Target step="welcome">
        <WelcomeBanner />
      </Flow.Target>

      <Flow.Gate when="welcome">
        <Button title="Next" onPress={next} />
      </Flow.Gate>

      <Flow.Target
        step="profile"
        spotlight
        tooltip={{
          component: <Text>Complete your profile!</Text>,
          side: 'bottom',
        }}
      >
        <ProfileCard />
      </Flow.Target>

      <Flow.Gate showWhenFinished>
        <Text>Tour complete!</Text>
      </Flow.Gate>
    </>
  );
}
```

---

## Core Concepts

### `Flow.Provider`

The root component that manages all flow state. Wrap your screen (or the relevant subtree) with it.

```tsx
<Flow.Provider
  steps={['step-a', 'step-b', 'step-c']}
  autoStart={false}
  onStart={() => analytics.track('start_flow')}
  onFinish={(data) => saveProgress(data)}
  onStepChange={(from, to) => {
    console.log('from', from.id, from.index);
    console.log('to', to.id, to.index);
  }}
>
  {children}
</Flow.Provider>
```

**Props**

| Prop           | Type                                   | Default      | Description                                                                                                                                        |
| -------------- | -------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `string`                               | —            | Unique identifier for the flow. Can be omitted when the app uses only one flow. If multiple flows are defined, use unique IDs to distinguish them. |
| `steps`        | `string[]`                             | **required** | Ordered list of step IDs.                                                                                                                          |
| `autoStart`    | `boolean`                              | `false`      | Start the flow immediately on mount.                                                                                                               |
| `initialData`  | `Record<string, unknown>`              | `{}`         | Seed data available throughout the flow.                                                                                                           |
| `onStart`      | `(data) => void \| Promise<void>`      | —            | Called once when the flow starts. Data in callback is always initialData.                                                                          |
| `onFinish`     | `(data) => void \| Promise<void>`      | —            | Called once when the flow completes.                                                                                                               |
| `onStepChange` | `(from: StepRef, to: StepRef) => void` | —            | Called on every step transition.                                                                                                                   |

> **`StepRef`** — `{ id: string; index: number }` — A snapshot of a step at the moment of a transition. `id` matches the string passed to `Flow.Target`, and `index` is the zero-based position in the sequence.

---

### `Flow.Gate`

Conditionally renders children based on flow state.

**Examples:**

**_The child component is only rendered when the "welcome" step is active._**

```tsx
<Flow.Gate when={'welcome'}>{children}</Flow.Gate>
```

**_The child component is only rendered when when the active step is within this range ._**

```tsx
<Flow.Gate when={{ from: 'welcome', to: 'profile' }}>{children}</Flow.Gate>
```

**_The child component is only rendered beflore the flow starts ._**

```tsx
<Flow.Gate showWhenIdle>{children}</Flow.Gate>
```

**_The child component is only rendered when the flow is finished ._**

```tsx
<Flow.Gate showWhenFinished>{children}</Flow.Gate>
```

**Props**

| Prop               | Type                                               | Default | Description                                                                              |
| ------------------ | -------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `provider`         | `string`                                           | —       | The ID of the provider associated with this component. Must match a defined provider ID. |
| `when`             | `string \| string[] \| { from, until?, exclude? }` | —       | Show only during specific step(s) or a range.                                            |
| `showWhenIdle`     | `boolean`                                          | `false` | Show when the flow has not started.                                                      |
| `showWhenActive`   | `boolean`                                          | `true`  | Show whenever the flow is active (any step).                                             |
| `showWhenFinished` | `boolean`                                          | `false` | Show after the flow finishes.                                                            |

---

### `Flow.Target`

Marks a subtree as belonging to a specific step and brings the content into view when the assigned step is active.

```tsx
<Flow.Target
  step="my-step"
  spotlight={{ inset: 8 }}
  tooltip={{ component: <MyTooltip />, side: 'bottom', offset: 4 }}
  onOverlayPress={() => flow.next()}
>
  <MyComponent />
</Flow.Target>
```

**Props**

| Prop             | Type                         | Default      | Description                                                                                   |
| ---------------- | ---------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `provider`       | `string`                     | —            | The ID of the provider associated with this component. Must match a defined provider ID.      |
| `step`           | `string`                     | **required** | The step ID this target belongs to.                                                           |
| `spotlight`      | `boolean \| SpotlightConfig` | —            | Highlights the step's content. Pass `true` for defaults or a config object for customization. |
| `tooltip`        | `ReactNode \| TooltipConfig` | —            | Renders a tooltip adjacent to the step's content.                                             |
| `onOverlayPress` | `() => void`                 | —            | Called when the user taps the overlay when spotlight and/or tooltip is available.             |
| `onActive`       | `() => void`                 | —            | Called when the element goes into view.                                                       |
| `children`       | `ReactNode`                  | **required** | The single element to highlight and/or scrolled to. Must accept a ref.                        |

**Spotlight**

Spotlight dims everything except the active step's content, drawing attention to a specific element.

**_Optional_**:

Install react-native-svg (If installed, the spotlight effect will be made with svgs. Otherwise, the lib would render spotlight using react native views) :

```sh
# npm
npm install react-native-svg

# yarn
yarn add react-native-svg
```

**_Examples_**:

```tsx
// Simple: use defaults
<Flow.Target step="save-button" spotlight>
  <SaveButton />
</Flow.Target>

// With custom inset and overlay style
<Flow.Target
  step="save-button"
  spotlight={{
    inset: 12,
    color: "#333333",
    opacity: 0.75
  }}
>
  <SaveButton />
</Flow.Target>

// Per-axis inset
<Flow.Target step="save-button" spotlight={{ inset: { x: 16, y: 8 } }}>
  <SaveButton />
</Flow.Target>
```

**`SpotlightConfig`**

| Property  | Type                                   | Default | Description                                                  |
| --------- | -------------------------------------- | ------- | ------------------------------------------------------------ |
| `inset`   | `number \| { x?: number; y?: number }` | `8`     | Extra space around the highlighted element.                  |
| `color`   | `ColorValue`                           | `#000`  | The background color of the spotlight overlay.               |
| `opacity` | `number`                               | `0.5`   | Styles applied to each overlay panel (color, opacity, etc.). |

**Tooltips**

Tooltips are positioned automatically on the side with the most available screen space, or you can pin them to a specific side.

```tsx
// Simple — just pass a ReactNode
<Flow.Target step="my-step" tooltip={<MyTooltip />}>
  <MyComponent />
</Flow.Target>

// Advanced — use TooltipConfig for positioning control
<Flow.Target
  step="my-step"
  tooltip={{
    component: <MyTooltip />,
    side: 'bottom',
    align: 'center',
    offset: 8,
  }}
>
  <MyComponent />
</Flow.Target>
```

**`TooltipConfig`**

| Option      | Type                                     | Default      | Description                                                                                     |
| ----------- | ---------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| `component` | `ReactNode`                              | **required** | Content to render inside the tooltip.                                                           |
| `side`      | `'top' \| 'bottom' \| 'left' \| 'right'` | —            | Side of the element to place the tooltip on. The side with the most space is picked by default. |
| `align`     | `'start' \| 'center' \| 'end'`           | `center`     | Alignment of the tooltip according to the side its placed in.                                   |
| `offset`    | `number`                                 | `8`          | Extra gap between the element edge and the tooltip. Can be negative.                            |

**Overlay Handling**

Both `spotlight` and `tooltip` render an overlay that covers the screen around the highlighted element. The overlay for spotlight is darkened, while the overlay for tooltip is transparent. This overlay captures all touches, so the user cannot interact with anything outside the active step while it's displayed.

There are two ways to let the user dismiss or advance:

**1. Controls inside the tooltip** — the most common pattern. Put `next()` / `finish()` buttons directly in the tooltip component.

```tsx
function MyTooltip() {
  const { next } = useFlow();
  return (
    <View>
      <Text>Here's how this feature works.</Text>
      <Button title="Next" onPress={next} />
    </View>
  );
}

<Flow.Target step="feature-x" tooltip={<MyTooltip />}>
  <FeatureButton />
</Flow.Target>;
```

**2. `onOverlayPress`** — called when the user taps the overlay area (i.e. any other area that are not the step's children). Useful for "tap anywhere to continue" patterns or dismissible tours.

```tsx
<Flow.Target
  step="feature-x"
  spotlight
  tooltip={<Callout />}
  onOverlayPress={next}
>
  <FeatureButton />
</Flow.Target>
```

> **Note:** If neither controls nor `onOverlayPress` are provided, the user has no way to dismiss the overlay. Always ensure a path forward.

**Scrollable Flows**

For flows that span a `ScrollView`, use the `ScrollView` export in place of React Native's built-in `ScrollView`. This allows the flow to automatically scroll to bring active steps into view.

```tsx
import { Flow } from 'react-native-flowkit';

function LongForm() {
  return (
    <Flow.Provider steps={['name', 'email', 'address', 'submit']}>
      {/* some controls here */}
      <Flow.ScrollView>
        <Flow.Target step="name">
          <NameField />
        </Flow.Target>
        <Flow.Target step="email">
          <EmailField />
        </Flow.Target>
        <Flow.Target step="address">
          <AddressField />
        </Flow.Target>
        <Flow.Target step="submit">
          <SubmitButton />
        </Flow.Target>
      </Flow.ScrollView>
    </Flow.Provider>
  );
}
```

---

### `useFlow`

Access the flow state and navigation API from anywhere inside a `Flow.Provider`.

```tsx
//Reference default flow
const flow = useFlow();

//Reference specific flow
const otherFlow = useFlow('other');
```

**Parameters:**

| Parameter | Type     | Default | Description                                                                                 |
| --------- | -------- | ------- | ------------------------------------------------------------------------------------------- |
| `id`      | `string` | —       | The ID of the flow to reference. Defaults to the nearest parent Flow.Provider when omitted. |

**Returns `UseFlowReturn`**

| Property            | Type                               | Description                                                         |
| ------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `steps`             | `string[]`                         | Ordered list of step IDs.                                           |
| `status`            | `'idle' \| 'active' \| 'finished'` | Status of the flow.                                                 |
| `currentStep`       | `string \| null`                   | ID of the current step.                                             |
| `currentIndex`      | `number \| null`                   | Zero-based index of the current step.                               |
| `data`              | `TData`                            | User-defined flow data (see `Data` section).                        |
| `start()`           | `() => void`                       | Starts the flow from step 0. No-op if already active.               |
| `next()`            | `() => void`                       | Advances to the next step. Finishes the flow when on the last step. |
| `back()`            | `() => void`                       | Returns to the previous step. No-op if already on the first step    |
| `goTo(stepId)`      | `(string) => void`                 | Navigates directly to a step by ID.                                 |
| `finish()`          | `() => Promise<void>`              | Ends the flow and triggers `onFinish`.                              |
| `reset()`           | `() => void`                       | Resets all state and returns the flow to idle.                      |
| `updateData(patch)` | `(patch) => void`                  | Merges a patch into the flow data.                                  |

---

### Navigation

Steps are sequenced explicitly via the `steps` prop. The rendering order of targets do not matter.

```tsx
<Flow.Provider steps={['third', 'first', 'second']}>
  <Flow.Target step="first">...</Flow.Target>
  <Flow.Target step="second">...</Flow.Target>
  <Flow.Target step="third">...</Flow.Target>
</Flow.Provider>
```

**Common Patterns:**

```tsx
// Linear flow
<Button title="Back" onPress={flow.back} disabled={flow.currentIndex === 0} />
<Button
title={flow.currentIndex === flow.steps.length - 1 ? 'Finish' : 'Next'}
onPress={flow.next} />

// Skip to a specific step
<Button title="Skip to billing" onPress={() => flow.goTo('billing')} />

// Dismiss / abandon
<Button title="Skip tour" onPress={flow.finish} />

// Restart
<Button title="Replay" onPress={() => { flow.reset(); flow.start(); }} />
```

---

### Data

Store and update arbitrary data as the user progresses through a flow — useful when you want to avoid managing a separate state for form collection or onboarding preferences.

All components and hooks are fully typed. Pass a data shape as a generic to get typed `data` and `updateData`:

```tsx
interface OnboardingData {
  name: string;
  selectedPlan: 'free' | 'pro';
}

const flow = useFlow<OnboardingData>();
// flow.data.name is string
// flow.data.selectedPlan is 'free' | 'pro'
```

**Providing the type through the hook:**

```tsx
function NameStep() {
  const { data, updateData, next } = useFlow<OnboardingData>();

  return (
    <Flow.Target step="name">
      <TextInput
        value={data.name}
        onChangeText={(name) => updateData({ name })}
      />
      <Button title="Next" onPress={next} />
    </Flow.Target>
  );
}
```

**Providing the type through the provider:**

```tsx
<Flow.Provider<OnboardingData>
  steps={['name', 'plan', 'confirm']}
  initialData={{ name: '', selectedPlan: 'free' }}
  onFinish={(data) => createAccount(data)}
>
  <AppContent />
</Flow.Provider>
```

#### Updating data:

`updateData` accepts either a partial object or an updater function:

```tsx
// Partial patch
updateData({ plan: 'pro' });

// Updater function
updateData((prev) => ({ count: prev.count + 1 }));
```

---

## TypeScript

Key exported types:

| Type                   | Description                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ProviderProps<TData>` | Props for `Flow.Provider`                                                                                             |
| `UseFlowReturn<TData>` | Return type of `useFlow`                                                                                              |
| `FlowStatus`           | `'idle' \| 'active' \| 'finished'`                                                                                    |
| `TargetProps`          | Props for `Flow.Target`                                                                                               |
| `Gate`                 | Props for `Flow.Gate`                                                                                                 |
| `StepRef`              | Snapshot of a step at transition time — `{ id: string; index: number }`. Passed to `onStepChange` as `from` and `to`. |
| `SpotlightConfig`      | Config for the `spotlight` prop                                                                                       |
| `TooltipConfig`        | Config for the `tooltip` prop                                                                                         |

---

## Examples

### Basic linear tour

```tsx
function AppTour() {
  return (
    <Flow.Provider steps={['search', 'filters', 'results']} autoStart>
      <TourContent />
    </Flow.Provider>
  );
}

function TourContent() {
  const { next } = useFlow();

  const tooltip = (label: string) => (
    <View style={styles.tooltip}>
      <Text>{label}</Text>
      <Button title={'Next'} onPress={next} />
    </View>
  );

  return (
    <>
      <Flow.Target
        step="search"
        spotlight
        tooltip={{ component: tooltip('Use this to search'), side: 'bottom' }}
      >
        <SearchBar />
      </Flow.Target>

      <Flow.Target
        step="filters"
        spotlight
        tooltip={{ component: tooltip('Filter your results'), side: 'right' }}
      >
        <FilterButton />
      </Flow.Target>

      <Flow.Target
        step="results"
        spotlight
        tooltip={{
          component: tooltip('Your results appear here'),
          side: 'top',
        }}
      >
        <ResultsList />
      </Flow.Target>
    </>
  );
}
```

### Scrollable tour

```tsx
import { Flow } from 'react-native-flowkit';

function ScrollableTour() {
  return (
    <Flow.Provider autoStart>
      <Flow.ScrollView>
        <Flow.Target step="header" spotlight tooltip={<HeaderTip />}>
          <Header />
        </Flow.Target>

        {/* This step is below the fold — this target is scrolled to automatically when the "footer" step is active*/}
        <Flow.Target step="footer" spotlight tooltip={<FooterTip />}>
          <Footer />
        </Flow.Target>
      </Flow.ScrollView>
    </Flow.Provider>
  );
}
```

### Tap-to-advance overlay

```tsx
<Flow.Target step="intro" spotlight onOverlayPress={next}>
  <HeroImage />
</Flow.Target>
```

### Manually starting a tour

```tsx
function HomeScreen() {
  return (
    <Flow.Provider steps={['fab', 'menu']} onFinish={() => markTourSeen()}>
      <HomeContent />
    </Flow.Provider>
  );
}

function HomeContent() {
  const { start } = useFlow();

  useEffect(() => {
    const seen = AsyncStorage.getItem('tour_seen');
    if (!seen) start();
  }, []);

  return (
    <>
      <Flow.Target step="fab" spotlight tooltip={<FabTip />}>
        <FAB />
      </Flow.Target>
      <Flow.Target step="menu" spotlight tooltip={<MenuTip />}>
        <MenuButton />
      </Flow.Target>
    </>
  );
}
```

### Multiple flows

```tsx
function Dashboard() {
  return (
    <>
      <Flow.Provider
        id="onboarding"
        steps={['profile', 'workspace', 'invite']}
        autoStart
      >
        <OnboardingTour />
      </Flow.Provider>

      <Flow.Provider id="analytics" steps={['chart', 'export']}>
        <AnalyticsTour />
      </Flow.Provider>
    </>
  );
}

function OnboardingTour() {
  const { next } = useFlow('onboarding');

  return (
    <>
      <Flow.Target
        step="profile"
        tooltip={{
          component: <TourTip text="Complete your profile" onNext={next} />,
        }}
      >
        <ProfileCard />
      </Flow.Target>

      <Flow.Target
        step="workspace"
        tooltip={{
          component: <TourTip text="Set up your workspace" onNext={next} />,
        }}
      >
        <WorkspaceSettings />
      </Flow.Target>

      <Flow.Target
        step="invite"
        tooltip={{
          component: <TourTip text="Invite your teammates" onNext={next} />,
        }}
      >
        <InviteButton />
      </Flow.Target>
    </>
  );
}

function AnalyticsTour() {
  const { next } = useFlow('analytics');

  return (
    <>
      <Flow.Target
        provider="analytics"
        step="chart"
        tooltip={{
          component: <TourTip text="Track performance trends" onNext={next} />,
        }}
      >
        <AnalyticsChart />
      </Flow.Target>

      <Flow.Target
        provider="analytics"
        step="export"
        tooltip={{
          component: <TourTip text="Export your reports" onNext={next} />,
        }}
      >
        <ExportButton />
      </Flow.Target>
    </>
  );
}
```

---

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
