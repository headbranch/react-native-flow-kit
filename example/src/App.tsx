import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Flow, useFlow } from 'react-native-flow-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Data ────────────────────────────────────────────────────────────────────

const TASKS = [
  {
    id: '1',
    title: 'Design new dashboard layout for analytics module',
    tag: 'Design',
    done: false,
    due: null,
  },
  {
    id: '2',
    title: 'Send weekly engineering report to stakeholders',
    tag: 'Ops',
    done: true,
    due: null,
  },
  {
    id: '3',
    title: 'Review PRs for authentication refactor (v2.4)',
    tag: 'Dev',
    done: false,
    due: 'Today',
  },
  {
    id: '4',
    title: 'Stakeholder sync call — Q2 roadmap alignment',
    tag: 'Meet',
    done: false,
    due: 'Tomorrow 10:00',
  },
  {
    id: '5',
    title: 'Update onboarding documentation for new hires',
    tag: 'Docs',
    done: false,
    due: null,
  },
  {
    id: '6',
    title: 'Fix bug in task filtering on mobile dashboard',
    tag: 'Bug',
    done: false,
    due: 'Today',
  },
  {
    id: '7',
    title: 'Prepare demo for client presentation (Project Atlas)',
    tag: 'Client',
    done: false,
    due: 'Friday',
  },
  {
    id: '8',
    title: 'Refactor notification service for better performance',
    tag: 'Dev',
    done: false,
    due: null,
  },
  {
    id: '9',
    title: 'Update API documentation for v3 endpoints',
    tag: 'Docs',
    done: false,
    due: null,
  },
  {
    id: '10',
    title: 'Conduct UX review for onboarding flow improvements',
    tag: 'Design',
    done: false,
    due: null,
  },
  {
    id: '11',
    title: 'Plan sprint backlog for next iteration',
    tag: 'Agile',
    done: false,
    due: null,
  },
  {
    id: '12',
    title: 'Investigate performance drop on task list screen',
    tag: 'Dev',
    done: false,
    due: null,
  },
  {
    id: '13',
    title: 'Coordinate release checklist for v2.5 rollout',
    tag: 'Release',
    done: false,
    due: 'Next week',
  },
];

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Flow.Provider
      steps={['notifications', 'add-task', 'task-list']}
      onStart={() => console.log('[Flow] tour started')}
      onFinish={() =>
        Alert.alert("You're all set!", 'You now know the basics.')
      }
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.screen}>
        <TaskApp />
      </SafeAreaView>
    </Flow.Provider>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function TaskApp() {
  const { start, next } = useFlow();

  const visibleTasks = TASKS;

  return (
    <View style={{ flex: 1 }}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.headerTitle}>My tasks</Text>
        </View>

        <Flow.Target
          step="notifications"
          spotlight
          tooltip={{
            component: <Tooltip text="Notifications & reminders." />,
            side: 'left',
            offset: 8,
          }}
          onOverlayPress={next}
        >
          <TouchableOpacity>
            <Text style={styles.iconText}>🔔</Text>
            <View style={styles.badge} />
          </TouchableOpacity>
        </Flow.Target>
      </View>

      {/* ── List ── */}
      <Flow.ScrollView style={styles.list}>
        {visibleTasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}

        <Flow.Gate showWhenIdle={false} showWhenFinished={false}>
          <Flow.Target
            step="task-list"
            spotlight
            tooltip={{
              component: (
                <Tooltip text="This will dissappear once the flow is over." />
              ),
              offset: 8,
            }}
            onOverlayPress={next}
          >
            <View style={styles.bottomDemo}>
              <Text style={styles.bottomDemoTitle}>End of list</Text>
              <Text style={styles.bottomDemoText}>
                This component proves the library can guide users to content
                inside a scroll view.
              </Text>

              <TouchableOpacity
                style={styles.bottomDemoBtn}
                onPress={() =>
                  Alert.alert('Action', 'Bottom component triggered')
                }
              >
                <Text style={styles.bottomDemoBtnText}>Bottom action</Text>
              </TouchableOpacity>
            </View>
          </Flow.Target>
        </Flow.Gate>
      </Flow.ScrollView>

      {/* ── FAB ── */}
      <Flow.Target
        step="add-task"
        spotlight
        tooltip={{
          component: <Tooltip text="Create a new task." />,
          side: 'top',
          offset: 8,
          align: 'end',
        }}
        onOverlayPress={next}
      >
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      </Flow.Target>

      {/* ── Welcome ── */}
      <Flow.Gate showWhenIdle showWhenActive={false} showWhenFinished={false}>
        <View style={styles.welcomeOverlay}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeEmoji}>✅</Text>
            <Text style={styles.welcomeTitle}>Welcome</Text>
            <Text style={styles.welcomeBody}>
              Quick tour of the core interactions.
            </Text>

            <TouchableOpacity style={styles.startBtn} onPress={start}>
              <Text style={styles.startBtnText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Flow.Gate>
    </View>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function TaskRow({ task }: any) {
  return (
    <View style={[styles.taskRow, task.done && styles.taskRowDone]}>
      <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
        {task.done && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <View style={styles.taskBody}>
        <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>
          {task.title}
        </Text>

        {task.due && (
          <View
            style={task.due === 'Today' ? styles.duePill : styles.duePillMuted}
          >
            <Text
              style={
                task.due === 'Today'
                  ? styles.duePillText
                  : styles.duePillMutedText
              }
            >
              {task.due === 'Today' ? '⏰ ' : '🗓 '}
              {task.due}
            </Text>
          </View>
        )}
      </View>

      {task.tag && (
        <View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{task.tag}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Tooltip ────────────────────────────────────────────────────────────────

function Tooltip({ text }: { text: string }) {
  return (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipText}>{text}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9F9F7' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E0',
  },
  greeting: { fontSize: 13, color: '#888780' },
  headerTitle: { fontSize: 22, fontWeight: '600' },

  iconText: { fontSize: 18 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D85A30',
  },

  list: { flex: 1 },

  taskRow: {
    flexDirection: 'row',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5E0',
  },
  taskRowDone: { opacity: 0.5 },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D3D1C7',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  checkmark: { color: '#fff', fontSize: 12 },

  taskBody: { flex: 1 },

  taskTitle: { fontSize: 14, fontWeight: '500' },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#888' },

  duePill: {
    marginTop: 4,
    backgroundColor: '#FAECE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  duePillText: { fontSize: 11, color: '#993C1D' },

  duePillMuted: {
    marginTop: 4,
    backgroundColor: '#F1EFE8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  duePillMutedText: { fontSize: 11, color: '#5F5E5A' },

  tag: {
    backgroundColor: '#EEEDFE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    marginLeft: 8,
  },

  tagText: { fontSize: 11, color: '#534AB7' },

  bottomDemo: {
    margin: 16,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#EEEDFE',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#AFA9EC',
    gap: 6,
  },
  bottomDemoTitle: { fontSize: 14, fontWeight: '600', color: '#2A275A' },
  bottomDemoText: { fontSize: 13, color: '#534AB7', lineHeight: 18 },
  bottomDemoBtn: {
    marginTop: 10,
    backgroundColor: '#534AB7',
    padding: 10,
    borderRadius: 10,
  },
  bottomDemoBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#534AB7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 28 },

  welcomeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    marginHorizontal: 24,
  },
  welcomeEmoji: { fontSize: 40 },
  welcomeTitle: { fontSize: 18, fontWeight: '700', marginTop: 10 },
  welcomeBody: {
    fontSize: 13,
    color: '#5F5E5A',
    textAlign: 'center',
    marginVertical: 12,
  },
  startBtn: {
    backgroundColor: '#534AB7',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 99,
    width: '100%',
    alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontWeight: '600' },
  skipText: { marginTop: 10, color: '#888' },

  tooltip: {
    backgroundColor: '#1A1A18',
    padding: 10,
    borderRadius: 10,
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  tooltipText: { color: '#fff', fontSize: 13 },
});
