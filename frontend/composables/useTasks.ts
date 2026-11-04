export type TaskStatus = 'Todo' | 'In Progress' | 'Completed'
export type ApiTaskStatus = 'todo' | 'in-progress' | 'completed'
export type TaskPriority = 'Low' | 'Medium' | 'High'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: string
}

interface ApiTask {
  id: number
  title: string
  description: string
  status: ApiTaskStatus
  createdAt: string
  updatedAt: string
}

export type TaskDraft = Pick<Task, 'title' | 'description' | 'status' | 'priority'>

function toApiStatus(status: TaskStatus): ApiTaskStatus {
  if (status === 'In Progress') return 'in-progress'
  return status === 'Completed' ? 'completed' : 'todo'
}

function toUiStatus(status: ApiTaskStatus): TaskStatus {
  if (status === 'in-progress') return 'In Progress'
  return status === 'completed' ? 'Completed' : 'Todo'
}

function apiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const value = error as { data?: { message?: string | string[]; statusMessage?: string }; statusMessage?: string; message?: string }
    const message = value.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (message) return message
    if (value.data?.statusMessage) return value.data.statusMessage
    if (value.statusMessage) return value.statusMessage
    if (value.message) return value.message
  }
  return 'Something went wrong while communicating with the task service.'
}

export function useTasks() {
  const tasks = useState<Task[]>('tasks', () => [])
  const isLoading = useState('tasks-loading', () => true)
  const isMutating = useState('tasks-mutating', () => false)
  const error = useState<string | null>('tasks-error', () => null)
  // The current API has no priority field. Keep this presentation-only value for
  // the active browser session, without sending unsupported fields upstream.
  const priorities = useState<Record<number, TaskPriority>>('task-priorities', () => ({}))

  function mapTask(task: ApiTask): Task {
    return {
      id: Number(task.id),
      title: task.title,
      description: task.description,
      status: toUiStatus(task.status),
      priority: priorities.value[task.id] ?? 'Medium',
      createdAt: task.createdAt,
    }
  }

  async function refreshTasks() {
    isLoading.value = true
    error.value = null
    try {
      const response = await $fetch<ApiTask[]>('/api/tasks')
      tasks.value = response.map(mapTask)
    } catch (cause) {
      error.value = apiErrorMessage(cause)
      throw cause
    } finally {
      isLoading.value = false
    }
  }

  async function addTask(draft: TaskDraft) {
    isMutating.value = true
    error.value = null
    try {
      const created = await $fetch<ApiTask>('/api/tasks', {
        method: 'POST',
        body: {
          title: draft.title,
          description: draft.description,
          status: toApiStatus(draft.status),
        },
      })
      priorities.value[created.id] = draft.priority
      await refreshTasks()
    } catch (cause) {
      if (!error.value) error.value = apiErrorMessage(cause)
      throw cause
    } finally {
      isMutating.value = false
    }
  }

  async function updateTask(updated: Task) {
    isMutating.value = true
    error.value = null
    try {
      await $fetch<ApiTask>(`/api/tasks/${updated.id}`, {
        method: 'PATCH',
        body: {
          title: updated.title,
          description: updated.description,
          status: toApiStatus(updated.status),
        },
      })
      priorities.value[updated.id] = updated.priority
      await refreshTasks()
    } catch (cause) {
      if (!error.value) error.value = apiErrorMessage(cause)
      throw cause
    } finally {
      isMutating.value = false
    }
  }

  async function deleteTask(id: number) {
    isMutating.value = true
    error.value = null
    try {
      await $fetch<void>(`/api/tasks/${id}`, { method: 'DELETE' })
      delete priorities.value[id]
      await refreshTasks()
    } catch (cause) {
      if (!error.value) error.value = apiErrorMessage(cause)
      throw cause
    } finally {
      isMutating.value = false
    }
  }

  async function setStatus(id: number, status: TaskStatus) {
    const existing = tasks.value.find(task => task.id === id)
    if (!existing) return
    await updateTask({ ...existing, status })
  }

  return { tasks, isLoading, isMutating, error, refreshTasks, addTask, updateTask, deleteTask, setStatus }
}
