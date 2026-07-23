export const useCommonStore = defineStore(
  'common',
  () => {
    // left drawer open/close 여부
    const stateDrawerOpen = ref(false)
    const drawerOpen = computed(() => stateDrawerOpen.value)
    const setDrawerOpen = (flag: boolean) => {
      stateDrawerOpen.value = flag
    }
    // left drawer open/close 여부

    // active Menu
    const stateActiveMenu = ref('')
    const activeMenu = computed(() => stateActiveMenu.value)
    const setActiveMenu = (menu: string) => {
      stateActiveMenu.value = menu
    }
    // active Menu

    const stateParams = ref<Record<string, any>>({})
    const getParams = computed(() => stateParams.value)
    const setParams = (path: string, params: any) => {
      stateParams.value[path] = params
    }
    const deleteParams = (path: string) => {
      delete stateParams.value[path]
    }

    return {
      stateDrawerOpen,
      drawerOpen,
      setDrawerOpen,
      stateActiveMenu,
      activeMenu,
      setActiveMenu,
      stateParams,
      getParams,
      setParams,
      deleteParams,
    }
  },
  { persist: true },
)
