import { api } from '@common/api'

api.setBaseURL('/apis')

export const apiStatTot = async (params?: Record<string, any>) => await api.get('/mylord/stat/tot', params)

export const apiStatPart = async (params?: Record<string, any>) => await api.get('/mylord/stat/part', params)

export const apiStatPerson = async (params?: Record<string, any>) => await api.get('/mylord/stat/person', params)
