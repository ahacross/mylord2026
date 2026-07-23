import { reactive, toRefs, type Ref } from 'vue'

export interface QuerySource<T = any, P = any> {
  queryFn: (params?: P) => Promise<T>
  immediate?: boolean
}

export interface QueryState<T = any> {
  data: T | undefined
  error: any
  isLoading: boolean
  isFinished: boolean
}

export interface UseQueryReturn<T = any, P = any> {
  data: Ref<T | undefined>
  error: Ref<any>
  isLoading: Ref<boolean>
  isFinished: Ref<boolean>
  refetch: (params?: P) => Promise<void>
}

export const useQuery = <T = any, P = any>(
  source: QuerySource<T, P>,
  paramsRef?: Ref<P> | { value: P },
): UseQueryReturn<T, P> => {
  const state = reactive<QueryState<T>>({
    data: undefined,
    error: null,
    isLoading: false,
    isFinished: false,
  })

  const execute = async (params?: P) => {
    state.isLoading = true
    state.error = null

    try {
      const res = (await source.queryFn(params)) as any
      if (typeof res === 'string' && res.trim().startsWith('<')) {
        state.error = new Error('Invalid API response: HTML string received instead of JSON')
        state.data = undefined
      } else {
        state.data = res
      }
    } catch (err) {
      state.error = err
    } finally {
      state.isLoading = false
      state.isFinished = true
    }
  }

  if (source?.immediate) {
    execute(paramsRef?.value)
  }

  const refs = toRefs(state)

  return {
    data: refs.data as unknown as Ref<T | undefined>,
    error: refs.error,
    isLoading: refs.isLoading,
    isFinished: refs.isFinished,
    refetch: (params?: P) => execute(params ?? paramsRef?.value),
  }
}
