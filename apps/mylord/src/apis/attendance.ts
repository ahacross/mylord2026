import { api } from '@common/api'

api.setBaseURL('/apis')

export const apiAttendanceList = async (attendance_date: string, part?: string) => await api.get('/mylord/attendance', { attendance_date, part })

export const apiAttendanceInsert = async (data: Record<string, any>) => await api.post('/mylord/attendance', data)

export const apiAttendanceDelete = async (data: Record<string, any>) => await api.delete('/mylord/attendance', data)
