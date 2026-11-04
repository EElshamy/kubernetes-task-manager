import { createError, getMethod, readBody, type H3Event } from 'h3'

interface UpstreamError {
  response?: { status?: number; statusText?: string }
  data?: { message?: string | string[]; statusMessage?: string; [key: string]: unknown }
  message?: string
}

export async function proxyTasksRequest(event: H3Event, taskId?: string) {
  const method = getMethod(event).toUpperCase()
  const allowedMethods = taskId ? ['GET', 'PATCH', 'DELETE'] : ['GET', 'POST']
  if (!allowedMethods.includes(method)) {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  if (taskId && (!/^\d+$/.test(taskId) || !Number.isSafeInteger(Number(taskId)) || Number(taskId) < 1)) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID must be a positive integer' })
  }

  const config = useRuntimeConfig(event)
  const backendUrl = String(config.backendUrl || '').replace(/\/+$/, '')
  if (!backendUrl) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_BACKEND_URL is not configured' })
  }

  const url = `${backendUrl}/tasks${taskId ? `/${taskId}` : ''}`
  const body = ['POST', 'PATCH'].includes(method) ? await readBody(event) : undefined
  try {
    return await $fetch(url, { method, ...(body === undefined ? {} : { body }) })
  } catch (cause) {
    const upstream = cause as UpstreamError
    if (upstream.response?.status) {
      const statusCode = upstream.response.status
      const detail = upstream.data?.message
      const statusMessage = Array.isArray(detail)
        ? detail.join(', ')
        : detail || upstream.data?.statusMessage || upstream.response.statusText || 'Task service request failed'
      throw createError({ statusCode, statusMessage: String(statusMessage), data: upstream.data })
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to reach the backend task service',
      data: { message: upstream.message || 'Check NUXT_BACKEND_URL and backend availability.' },
    })
  }
}
