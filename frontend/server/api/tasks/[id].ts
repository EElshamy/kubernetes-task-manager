import { defineEventHandler, getRouterParam } from 'h3'
import { proxyTasksRequest } from '../../utils/tasks-proxy'

export default defineEventHandler(event => proxyTasksRequest(event, getRouterParam(event, 'id')))
