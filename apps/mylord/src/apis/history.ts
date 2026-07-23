import { api } from '@common/api'



// 부른 곡들 목록
export const apiGetHistory = async () => await api.get('/mylord/praised')

// 추가
export const apiInsertHistory = async (data: Record<string, any>) => await api.post('/mylord/praised', data)

// 수정
export const apiPutHistory = async (data: Record<string, any>) => await api.put('/mylord/praised', data)

// 삭제
export const apiDeleteHistory = async (data: Record<string, any>) => await api.delete('/mylord/praised', data)

export const apiGetPractice = async () => await api.get('/mylord/praised/practice')
