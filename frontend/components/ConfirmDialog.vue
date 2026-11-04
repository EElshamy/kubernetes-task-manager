<script setup lang="ts">
defineProps<{ open: boolean; title?: string; busy?: boolean }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
</script>

<template>
  <Teleport to="body"><div v-if="open" class="modal-backdrop" @click.self="!busy && emit('close')"><section class="dialog confirm-dialog" role="alertdialog" aria-modal="true"><div class="confirm-icon"><AppIcon name="trash" /></div><h2>Delete this task?</h2><p><strong>{{ title }}</strong> will be permanently removed from your task list.</p><div class="dialog-actions"><button class="button button-secondary" :disabled="busy" @click="emit('close')">Cancel</button><button class="button button-danger" :disabled="busy" @click="emit('confirm')">{{ busy ? 'Deleting...' : 'Delete task' }}</button></div></section></div></Teleport>
</template>
