import { api } from '@common/api'



// 개인 회비 내역 조회
export const apiGetDues = async (params?: Record<string, any>) => await api.get('/mylord/dues', params)

// 파트별 회비내역
export const apiDuesList = async (part: string, params?: Record<string, any>) => await api.get(`/mylord/dues/${part}`, params)

export const apiDuesInsert = async (data: Record<string, any>) => await api.put('/mylord/dues', data)
