<script setup lang="ts">
import type { Task, TaskPriority, TaskStatus } from '~/composables/useTasks'

const props = defineProps<{ open: boolean; task?: Task | null; saving?: boolean }>()
const emit = defineEmits<{ close: []; save: [task: { title: string; description: string; status: TaskStatus; priority: TaskPriority } | Task] }>()
const title = ref('')
const description = ref('')
const status = ref<TaskStatus>('Todo')
const priority = ref<TaskPriority>('Medium')
const editing = computed(() => !!props.task)

watch(() => [props.open, props.task] as const, ([open, task]) => {
  if (open) {
    title.value = task?.title ?? ''
    description.value = task?.description ?? ''
    status.value = task?.status ?? 'Todo'
    priority.value = task?.priority ?? 'Medium'
  }
}, { immediate: true })

function submit() {
  if (!title.value.trim()) return
  const value = { title: title.value.trim(), description: description.value.trim(), status: status.value, priority: priority.value }
  emit('save', props.task ? { ...props.task, ...value } : value)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="emit('close')" @keydown.esc="emit('close')">
      <section class="dialog" role="dialog" aria-modal="true" :aria-labelledby="'task-dialog-title'">
        <div class="dialog-heading">
          <div><span class="eyebrow">TASK DETAILS</span><h2 id="task-dialog-title">{{ editing ? 'Edit task' : 'Create a task' }}</h2><p>{{ editing ? 'Make a few updates to this task.' : 'Add a new item to your workspace.' }}</p></div>
          <button class="icon-button" aria-label="Close dialog" @click="emit('close')"><AppIcon name="close" /></button>
        </div>
        <form class="task-form" @submit.prevent="submit">
          <label>Task title <span class="required">*</span><input v-model="title" autofocus required maxlength="100" placeholder="e.g. Review deployment plan"></label>
          <label>Description <span class="required">*</span><textarea v-model="description" rows="3" maxlength="500" required placeholder="Add a few details about this task..."></textarea></label>
          <div class="form-row"><label>Status<select v-model="status"><option>Todo</option><option>In Progress</option><option>Completed</option></select></label><label>Priority<select v-model="priority"><option>Low</option><option>Medium</option><option>High</option></select></label></div>
          <div class="dialog-actions"><button type="button" class="button button-secondary" :disabled="saving" @click="emit('close')">Cancel</button><button type="submit" class="button button-primary" :disabled="saving"><AppIcon :name="saving ? 'clock' : editing ? 'check' : 'plus'" size="16" />{{ saving ? 'Saving...' : editing ? 'Save changes' : 'Create task' }}</button></div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
