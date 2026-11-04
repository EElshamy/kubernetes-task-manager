export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Taskflow — Task Manager',
      meta: [
        { name: 'description', content: 'A focused workspace for planning and tracking your work.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#f6f8fb' },
      ],
    },
  },
  nitro: {
    preset: 'node-server',
  },
  runtimeConfig: {
    backendUrl: 'http://backend:3000',
  },
})
