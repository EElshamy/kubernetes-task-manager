<script setup lang="ts">
import type { Task, TaskDraft, TaskStatus } from '~/composables/useTasks'
import type { Toast } from '~/components/ToastStack.vue'

const { tasks, isLoading, isMutating, error: tasksError, refreshTasks, addTask, updateTask, deleteTask, setStatus } = useTasks()
const query = ref('')
const statusFilter = ref('All tasks')
const priorityFilter = ref('All priorities')
const dialogOpen = ref(false)
const editingTask = ref<Task | null>(null)
const deletingTask = ref<Task | null>(null)
const isDeleting = ref(false)
const menuTaskId = ref<number | null>(null)
const sidebarOpen = ref(false)
const toasts = ref<Toast[]>([])
const activeNav = ref('Overview')
let toastCounter = 0

const total = computed(() => tasks.value.length)
const completed = computed(() => tasks.value.filter(t => t.status === 'Completed').length)
const pending = computed(() => tasks.value.filter(t => t.status === 'Todo').length)
const inProgress = computed(() => tasks.value.filter(t => t.status === 'In Progress').length)
const completionPercent = computed(() => total.value ? Math.round(completed.value / total.value * 100) : 0)
const filteredTasks = computed(() => tasks.value.filter(task => {
  const term = query.value.trim().toLowerCase()
  const matchesSearch = !term || `${task.title} ${task.description}`.toLowerCase().includes(term)
  const matchesStatus = statusFilter.value === 'All tasks' || task.status === statusFilter.value
  const matchesPriority = priorityFilter.value === 'All priorities' || task.priority === priorityFilter.value
  return matchesSearch && matchesStatus && matchesPriority
}))
const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

onMounted(() => { void refreshTasks().catch(() => {}) })

function notify(message: string, tone: Toast['tone'] = 'success') {
  const id = ++toastCounter
  toasts.value.push({ id, message, tone })
  window.setTimeout(() => dismissToast(id), 3800)
}
function dismissToast(id: number) { toasts.value = toasts.value.filter(toast => toast.id !== id) }
function openCreate() { editingTask.value = null; dialogOpen.value = true }
function openEdit(task: Task) { editingTask.value = { ...task }; menuTaskId.value = null; dialogOpen.value = true }
async function saveTask(value: Task | TaskDraft) {
  try {
    if ('id' in value) {
      await updateTask(value)
      notify('Task updated successfully')
    } else {
      await addTask(value)
      notify('Task created successfully')
    }
    dialogOpen.value = false
  } catch {
    notify(tasksError.value || 'Unable to save the task. Please try again.', 'error')
  }
}
async function confirmDelete() {
  if (!deletingTask.value) return
  isDeleting.value = true
  try {
    await deleteTask(deletingTask.value.id)
    notify('Task deleted')
    deletingTask.value = null
  } catch {
    notify(tasksError.value || 'Unable to delete the task. Please try again.', 'error')
  } finally {
    isDeleting.value = false
  }
}
async function changeStatus(task: Task, status: TaskStatus) {
  menuTaskId.value = null
  try {
    await setStatus(task.id, status)
    notify(`Task marked ${status.toLowerCase()}`)
  } catch {
    notify(tasksError.value || 'Unable to update the task status.', 'error')
  }
}
function formatDate(date: string) {
  const value = date.includes('T') ? new Date(date) : new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(value)
}
function navClick(name: string) {
  activeNav.value = name
  sidebarOpen.value = false
  if (name === 'Tasks') document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' })
  if (!['Overview', 'Tasks'].includes(name)) notify(`${name} view is coming soon`, 'error')
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="brand"><div class="brand-mark"><span></span><span></span><span></span><span></span></div><span>task<span class="brand-light">flow</span></span><button class="mobile-close icon-button" aria-label="Close menu" @click="sidebarOpen = false"><AppIcon name="close" /></button></div>
      <div class="workspace-switcher"><div class="workspace-avatar">A</div><div class="workspace-copy"><strong>Acme workspace</strong><span>Free plan</span></div><AppIcon name="chevron-down" size="15" /></div>
      <div class="nav-label">WORKSPACE</div>
      <nav class="main-nav" aria-label="Main navigation">
        <button v-for="item in [{ name: 'Overview', icon: 'grid' }, { name: 'Tasks', icon: 'check-square', count: total }, { name: 'Calendar', icon: 'calendar' }, { name: 'Reports', icon: 'chart' }]" :key="item.name" class="nav-item" :class="{ active: activeNav === item.name }" @click="navClick(item.name)"><AppIcon :name="item.icon" /><span>{{ item.name }}</span><span v-if="item.count !== undefined" class="nav-count">{{ item.count }}</span></button>
      </nav>
      <div class="nav-label nav-label-spaced">PREFERENCES</div>
      <nav class="main-nav" aria-label="Preferences"><button class="nav-item" :class="{ active: activeNav === 'Settings' }" @click="navClick('Settings')"><AppIcon name="settings" /><span>Settings</span></button></nav>
      <div class="sidebar-bottom"><div class="upgrade-card"><div class="upgrade-sparkle">✦</div><strong>Make work flow</strong><p>Unlock more ways to organize your team's work.</p><button @click="notify('You are on the free plan')">Explore plans <AppIcon name="arrow-up-right" size="14" /></button></div><button class="profile-button" @click="notify('Signed in as Eslam Elshamy')"><div class="profile-avatar">EE</div><div class="profile-copy"><strong>Eslam Elshamy</strong><span>alex@acme.co</span></div><AppIcon name="more" size="17" /></button></div>
    </aside>
    <div v-if="sidebarOpen" class="sidebar-scrim" @click="sidebarOpen = false"></div>

    <main class="main-area">
      <header class="topbar"><div class="topbar-left"><button class="mobile-menu icon-button" aria-label="Open menu" @click="sidebarOpen = true"><AppIcon name="menu" /></button><div class="breadcrumb">Workspace <span>/</span> <strong>{{ activeNav }}</strong></div></div><div class="topbar-right"><div class="search-box"><AppIcon name="search" size="17" /><input v-model="query" aria-label="Search tasks" placeholder="Search tasks..." /><kbd>⌘ K</kbd></div><button class="icon-button notification-button" aria-label="Notifications" @click="notify('You’re all caught up')"><AppIcon name="bell" /></button><div class="top-avatar">EE</div></div></header>
      <div class="content-wrap">
        <section class="welcome-row"><div><div class="eyebrow">{{ today }}</div><h1>Good morning, Eslam <span class="wave">✦</span></h1><p>Here's what's happening with your tasks today.</p></div><button class="button button-primary create-button" @click="openCreate"><AppIcon name="plus" size="17" /> New task</button></section>
        <section class="stats-grid" aria-label="Task summary">
          <article class="stat-card"><div class="stat-top"><span>Total tasks</span><span class="stat-icon stat-blue"><AppIcon name="check-square" /></span></div><div class="stat-number">{{ total }}<span class="stat-change"><AppIcon name="arrow-up-right" size="14" /> 12%</span></div><div class="stat-foot">Across your workspace</div></article>
          <article class="stat-card"><div class="stat-top"><span>Completed</span><span class="stat-icon stat-green"><AppIcon name="check" /></span></div><div class="stat-number">{{ completed }}<span class="stat-change"><AppIcon name="arrow-up-right" size="14" /> 8%</span></div><div class="stat-foot">Tasks finished so far</div></article>
          <article class="stat-card"><div class="stat-top"><span>In progress</span><span class="stat-icon stat-purple"><AppIcon name="clock" /></span></div><div class="stat-number">{{ inProgress }}<span class="stat-neutral">Active right now</span></div><div class="stat-foot">Keep the momentum going</div></article>
          <article class="stat-card"><div class="stat-top"><span>To do</span><span class="stat-icon stat-amber"><AppIcon name="grid" /></span></div><div class="stat-number">{{ pending }}<span class="stat-down"><AppIcon name="arrow-down-right" size="14" /> 4%</span></div><div class="stat-foot">Waiting to be started</div></article>
        </section>
        <section class="progress-card"><div class="progress-info"><div class="progress-icon"><AppIcon name="chart" /></div><div><div class="progress-title">Your weekly progress</div><div class="progress-subtitle">You're making great progress this week. Keep it up!</div></div></div><div class="progress-meter"><div class="progress-caption"><span>Overall completion</span><strong>{{ completionPercent }}%</strong></div><div class="progress-track"><div class="progress-fill" :style="{ width: `${completionPercent}%` }"></div></div></div><div class="progress-ring" :style="{ '--progress': `${completionPercent * 3.6}deg` }"><div><strong>{{ completionPercent }}%</strong><span>done</span></div></div></section>
        <section id="tasks" class="tasks-panel"><div class="panel-heading"><div><h2>Your tasks</h2><p>Manage and track all your work in one place.</p></div><button class="button button-primary panel-create" @click="openCreate"><AppIcon name="plus" size="16" /> Add task</button></div>
          <div class="task-toolbar"><div class="task-tabs"><button v-for="tab in ['All tasks', 'Todo', 'In Progress', 'Completed']" :key="tab" :class="{ selected: statusFilter === tab }" @click="statusFilter = tab">{{ tab }}<span v-if="tab === 'All tasks'">{{ total }}</span></button></div><div class="filters"><label class="select-filter"><AppIcon name="filter" size="15" /><select v-model="priorityFilter" aria-label="Filter by priority"><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select><AppIcon name="chevron-down" size="13" /></label><button class="filter-mobile" aria-label="Clear filters" @click="statusFilter = 'All tasks'; priorityFilter = 'All priorities'; query = ''"><AppIcon name="filter" size="16" /></button></div></div>
          <div v-if="isLoading && tasks.length" class="inline-state loading-state"><AppIcon name="clock" size="15" /> Refreshing tasks...</div>
          <div v-if="tasksError && tasks.length" class="inline-state error-state"><span>{{ tasksError }}</span><button @click="refreshTasks().catch(() => {})">Retry</button></div>
          <div v-if="isLoading && !tasks.length" class="empty-state"><div class="empty-icon"><AppIcon name="clock" size="23" /></div><h3>Loading your tasks</h3><p>Fetching the latest tasks from your workspace.</p></div>
          <div v-else-if="tasksError && !tasks.length" class="empty-state"><div class="empty-icon error-empty-icon"><AppIcon name="close" size="23" /></div><h3>We couldn't load your tasks</h3><p>{{ tasksError }}</p><button class="button button-primary" @click="refreshTasks().catch(() => {})">Try again</button></div>
          <div v-else-if="filteredTasks.length" class="table-scroll"><table class="task-table"><thead><tr><th class="task-col">TASK</th><th>STATUS</th><th>PRIORITY</th><th>CREATED</th><th class="actions-col"><span class="sr-only">Actions</span></th></tr></thead><tbody><tr v-for="task in filteredTasks" :key="task.id"><td class="task-cell"><span class="task-checkbox" :class="{ checked: task.status === 'Completed' }"><AppIcon v-if="task.status === 'Completed'" name="check" size="13" /></span><div class="task-details"><button class="task-name" :class="{ 'task-done': task.status === 'Completed' }" @click="openEdit(task)">{{ task.title }}</button><span>{{ task.description }}</span></div></td><td><span class="status-badge" :class="`status-${task.status.toLowerCase().replace(' ', '-')}`"><i></i>{{ task.status }}</span></td><td><span class="priority-label" :class="`priority-${task.priority.toLowerCase()}`"><span class="priority-dots"><i v-for="n in 3" :key="n" :class="{ filled: n <= (task.priority === 'High' ? 3 : task.priority === 'Medium' ? 2 : 1) }"></i></span>{{ task.priority }}</span></td><td class="date-cell">{{ formatDate(task.createdAt) }}</td><td class="row-actions"><div class="action-wrap"><button class="icon-button row-menu-button" :aria-label="`Actions for ${task.title}`" @click="menuTaskId = menuTaskId === task.id ? null : task.id"><AppIcon name="more" size="18" /></button><div v-if="menuTaskId === task.id" class="action-menu"><button @click="openEdit(task)"><AppIcon name="edit" size="15" /> Edit task</button><button v-if="task.status !== 'Completed'" @click="changeStatus(task, 'Completed')"><AppIcon name="check" size="15" /> Mark complete</button><button v-else @click="changeStatus(task, 'Todo')"><AppIcon name="clock" size="15" /> Reopen task</button><button class="delete-action" @click="deletingTask = task; menuTaskId = null"><AppIcon name="trash" size="15" /> Delete task</button></div></div></td></tr></tbody></table></div>
          <div v-else-if="!isLoading && !tasksError" class="empty-state"><div class="empty-icon"><AppIcon :name="query ? 'search' : 'check-square'" size="23" /></div><h3>{{ query || statusFilter !== 'All tasks' || priorityFilter !== 'All priorities' ? 'No matching tasks' : 'No tasks here yet' }}</h3><p>{{ query || statusFilter !== 'All tasks' || priorityFilter !== 'All priorities' ? 'Try a different search or adjust your filters.' : 'Create your first task to get your workspace moving.' }}</p><button v-if="!query && statusFilter === 'All tasks' && priorityFilter === 'All priorities'" class="button button-primary" @click="openCreate"><AppIcon name="plus" size="16" /> Create a task</button><button v-else class="text-button" @click="statusFilter = 'All tasks'; priorityFilter = 'All priorities'; query = ''">Clear filters</button></div>
          <div class="table-footer"><span>Showing <strong>{{ filteredTasks.length }}</strong> of <strong>{{ total }}</strong> tasks</span><div class="pagination"><button disabled aria-label="Previous page">‹</button><button class="page-current">1</button><button disabled aria-label="Next page">›</button></div></div>
        </section>
        <footer class="page-footer"><span>© 2026 Taskflow</span><span><a href="#tasks">Help center</a><a href="#tasks">Privacy</a><a href="#tasks">Terms</a></span></footer>
      </div>
    </main>
    <TaskDialog :open="dialogOpen" :task="editingTask" :saving="isMutating" @close="dialogOpen = false" @save="saveTask" />
    <ConfirmDialog :open="!!deletingTask" :title="deletingTask?.title" :busy="isDeleting" @close="deletingTask = null" @confirm="confirmDelete" />
    <ToastStack :items="toasts" @dismiss="dismissToast" />
  </div>
</template>
