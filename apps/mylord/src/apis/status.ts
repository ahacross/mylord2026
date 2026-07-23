import { api } from '@common/api'



export const apiGetStatus = async (params?: Record<string, any>) => await api.get('/mylord/status', params)
