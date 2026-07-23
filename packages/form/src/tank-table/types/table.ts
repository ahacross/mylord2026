import { type ColumnDef } from '@tanstack/vue-table'
import { type Component } from 'vue'

declare module '@tanstack/vue-table' {
  interface ColumnDefBase<TData, TValue> {
    align?: 'left' | 'center' | 'right'
    editComponent?: Component
  }
}

export type RowData = Record<string, any>

export type TankColumnDef<T> = ColumnDef<T> & {
  id: keyof T | string
  header: string
  size?: number
  align?: 'left' | 'center' | 'right'
  editComponent?: Component
}
