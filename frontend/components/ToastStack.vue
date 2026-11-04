<script setup lang="ts">
export interface Toast { id: number; message: string; tone: 'success' | 'error' }
defineProps<{ items: Toast[] }>()
const emit = defineEmits<{ dismiss: [id: number] }>()
</script>
<template>
  <div class="toast-stack" aria-live="polite"><TransitionGroup name="toast"><div v-for="toast in items" :key="toast.id" class="toast" :class="`toast-${toast.tone}`"><span class="toast-check"><AppIcon :name="toast.tone === 'success' ? 'check' : 'close'" size="15" /></span><span>{{ toast.message }}</span><button aria-label="Dismiss notification" @click="emit('dismiss', toast.id)"><AppIcon name="close" size="15" /></button></div></TransitionGroup></div>
</template>
