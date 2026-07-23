import { api } from '@common/api'
import { useStoreUser } from '@/stores/user'



export const apiCheckOfficer = async () => {
  const storeUser = useStoreUser()
  const member_id = (storeUser.info as any)?.member_id

  return await api.get(`/mylord/officer/${member_id}`, {
    year: new Date().getFullYear(),
    member_id,
  })
}

export const apiOfficerList = async (year: number | string) => await api.get('/mylord/officer', { year })

// 추가
export const apiInsertOfficer = async (data: Record<string, any>) => await api.post('/mylord/officer', data)

// 수정
export const apiPutOfficer = async (data: Record<string, any>) => await api.put('/mylord/officer', data)

export const apiDeleteOfficer = async (data: Record<string, any>) => await api.delete('/mylord/officer', data)
