import { api } from '@common/api'
import type { PracticeSong, BirthdayMember } from '@/views/types'

// api 싱글톤의 기본 baseURL 지정
api.setBaseURL('/apis')

// 찬양곡 목록 조회 API
export const getSongListApi = () => {
  return api.get<PracticeSong[]>('/mylord/praised/practice')
}

// 생일 멤버 목록 조회 API
export const getBirthdaysApi = (month: string) => {
  return api.get<BirthdayMember[]>(`/mylord/member/${month}`)
}
