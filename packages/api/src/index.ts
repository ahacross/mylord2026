import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type Method,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from 'axios'

export interface ApiRequestConfig extends AxiosRequestConfig {
  showAlert?: boolean
  useCache?: boolean
  cancelDuplicate?: boolean
  _retry?: boolean
}

export interface ApiClientOptions {
  baseURL?: string
  accessTokenKey?: string
  refreshTokenKey?: string
  refreshUrl?: string
  onSessionExpired?: () => void
  onErrorAlert?: (message: string) => void
}

export function createApiClient(options: ApiClientOptions = {}) {
  const {
    baseURL,
    accessTokenKey = 'access_token',
    refreshTokenKey = 'refresh_token',
    refreshUrl = '/auth/refresh',
    onSessionExpired,
    onErrorAlert = (msg) => alert(msg),
  } = options

  // 에러 핸들러 동적 갱신을 위한 변수화
  let errorAlertHandler = onErrorAlert

  const cache = new Map<string, { data: any; expire: number }>()
  const pendingRequests = new Map<string, AbortController>()

  let isRefreshing = false
  let refreshSubscribers: (() => void)[] = []

  const instance = axios.create({
    baseURL,
  })

  const getRequestKey = (config: AxiosRequestConfig): string => {
    return `${config.method}:${config.url}:${JSON.stringify(config.params || config.data)}`
  }

  const onRefreshed = () => {
    refreshSubscribers.forEach((cb) => cb())
    refreshSubscribers = []
  }

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const apiConfig = config as ApiRequestConfig
      const { method, useCache, cancelDuplicate } = apiConfig
      const requestKey = getRequestKey(config)

      if (useCache && method?.toLowerCase() === 'get') {
        const cached = cache.get(requestKey)
        if (cached && cached.expire > Date.now()) {
          ;(config as any).__isCacheHit = true
          ;(config as any).__cachedData = cached.data
        }
      }

      if (cancelDuplicate) {
        pendingRequests.get(requestKey)?.abort()
        const controller = new AbortController()
        config.signal = controller.signal
        pendingRequests.set(requestKey, controller)
      }

      const token = localStorage.getItem(accessTokenKey)
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => Promise.reject(error),
  )

  instance.interceptors.response.use(
    (res: AxiosResponse) => {
      const config = res.config as ApiRequestConfig
      const requestKey = getRequestKey(config)

      if ((config as any).__isCacheHit) return (config as any).__cachedData

      pendingRequests.delete(requestKey)

      if (config.useCache && config.method?.toLowerCase() === 'get') {
        cache.set(requestKey, { data: res.data, expire: Date.now() + 1000 * 60 * 5 })
      }

      return res.status >= 200 && res.status < 300 ? res.data : res
    },
    async (error: Error | AxiosError) => {
      if (!axios.isAxiosError(error)) return Promise.reject(error)

      const { config, response } = error
      const apiConfig = config as ApiRequestConfig

      if (axios.isCancel(error)) return new Promise(() => {})
      if (config) pendingRequests.delete(getRequestKey(config))

      if (response?.status === 401 && !apiConfig?._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            refreshSubscribers.push(() => resolve(instance(config!)))
          })
        }

        apiConfig._retry = true
        isRefreshing = true

        try {
          const refreshToken = localStorage.getItem(refreshTokenKey)
          const refreshRes = await axios.post(refreshUrl, { refreshToken }, { baseURL })
          localStorage.setItem(accessTokenKey, refreshRes.data.accessToken)

          isRefreshing = false
          onRefreshed()
          return instance(apiConfig)
        } catch (refreshErr) {
          isRefreshing = false
          refreshSubscribers = []

          if (onSessionExpired) {
            onSessionExpired()
          } else {
            if (apiConfig?.showAlert !== false) {
              errorAlertHandler('세션이 만료되었습니다. 다시 로그인해주세요.')
            }
          }
          return Promise.reject(refreshErr)
        }
      }

      if (apiConfig?.showAlert !== false) {
        const msgs: Record<number, string> = {
          400: '잘못된 요청',
          403: '권한 없음',
          404: '찾을 수 없음',
          500: '서버 오류',
        }
        errorAlertHandler(response ? msgs[response.status] || '오류 발생' : '네트워크 연결 확인')
      }

      return Promise.reject(error)
    },
  )

  const runRequest = (method: Method) => {
    return <T = any>(
      url: string,
      data: any = {},
      options: ApiRequestConfig = { showAlert: true, cancelDuplicate: true, useCache: false },
    ): Promise<T> => {
      return instance.request({
        url,
        method,
        [method.toLowerCase() === 'get' ? 'params' : 'data']: data,
        ...options,
      })
    }
  }

  const methods = ['get', 'post', 'put', 'patch', 'delete'] as const
  type HttpMethod = (typeof methods)[number]

  const requestMethods = methods.reduce(
    (acc, method) => {
      acc[method] = runRequest(method)
      return acc
    },
    {} as Record<HttpMethod, ReturnType<typeof runRequest>>,
  )

  const api = {
    axiosInstance: instance,
    ...requestMethods,
    setBaseURL: (url: string) => {
      instance.defaults.baseURL = url
    },
    setOnErrorAlert: (handler: (message: string) => void) => {
      errorAlertHandler = handler
    },
    downloadExcel: async (
      method: Method,
      url: string,
      data: any = {},
      fileNm: string = '',
      options?: ApiRequestConfig,
    ): Promise<Blob | void> => {
      try {
        const res = await api[method.toLowerCase() as HttpMethod](url, data, {
          ...options,
          responseType: 'blob',
        })

        if (res instanceof Blob) {
          const downloadUrl = window.URL.createObjectURL(res)
          const link = document.createElement('a')
          link.href = downloadUrl
          link.setAttribute('download', `${fileNm || new Date().getTime()}.xlsx`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(downloadUrl)
          return res
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message)
        }
        throw error
      }
    },
  }

  return api
}

// 싱글톤으로 인스턴스화한 기본 api 객체 export
export const api = createApiClient()

export * from './composables/useQuery'
