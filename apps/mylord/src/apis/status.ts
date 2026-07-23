import { api } from '@common/api'

api.setBaseURL('/apis')

export const apiGetStatus = async (params?: Record<string, any>) => await api.get('/mylord/status', params)
