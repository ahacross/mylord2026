import { api } from '@common/api'



export const apiEnrollmentList = async (attend_date: string, part?: string) => await api.get('/mylord/enrollment', { attend_date, part })

export const apiEnrollmentInsert = async (data: Record<string, any>) => await api.post('/mylord/enrollment', data)
