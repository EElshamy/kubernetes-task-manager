import { defineEventHandler } from 'h3'
import { proxyTasksRequest } from '../../utils/tasks-proxy'

export default defineEventHandler(event => proxyTasksRequest(event))
