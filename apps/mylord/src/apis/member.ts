import { api } from '@common/api'



export const apiGetMembers = async (params?: Record<string, any>) => await api.get('/mylord/member/list', params)
export const apiGetUserInfo = async (params?: Record<string, any>) => await api.get('/mylord/member', params)
export const apiCar = async () => await api.get('/mylord/member/car')

// 추가
export const apiInsertMember = async (data: Record<string, any>) => await api.post('/mylord/member', data)

// 수정
export const apiPutMember = async (data: Record<string, any>) => await api.put('/mylord/member', data)

export const apiGetBirthday = async (birthday: string) => await api.get(`/mylord/member/${birthday}`)
