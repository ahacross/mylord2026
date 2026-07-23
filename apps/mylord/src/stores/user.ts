export const useStoreUser = defineStore(
  'user',
  () => {
    // 사용자 정보
    const stateInfo = ref({})
    const info = computed(() => stateInfo.value)
    const setInfo = (userInfo: any) => {
      stateInfo.value = userInfo
    }
    // 사용자 정보

    // 사용자 권한
    const stateAuth = ref<any>({})
    const auth = computed(() => {
      if (['임원', '임원(팀장)', '임원(회계)', '서버관리자', '파트장'].includes(stateAuth.value)) {
        return 'admin'
      } else if (['파트장'].includes(stateAuth.value)) {
        return 'part'
      } else {
        return stateAuth.value
      }
    })
    const setAuth = (paramAuth: any) => {
      stateAuth.value = paramAuth
    }
    // 사용자 권한

    return { stateInfo, info, setInfo, stateAuth, auth, setAuth }
  },
  {
    persist: true,
  },
)
