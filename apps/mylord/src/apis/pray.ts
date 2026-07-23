import { api } from '@common/api'



export const apiMakeList = async () => await api.get('/mylord/pray/makeList')

export const apiLoadList = async (year?: number | string) => await api.get('/mylord/pray/loadList', { year })

export const apiPrayInsert = async (data: Record<string, any>) => await api.post('/mylord/pray', data)

export const apiPrayUpdate = async (data: Record<string, any>) => await api.put('/mylord/pray', data)

export const apiPrayDelete = async (data: Record<string, any>) => await api.delete('/mylord/pray', data)
