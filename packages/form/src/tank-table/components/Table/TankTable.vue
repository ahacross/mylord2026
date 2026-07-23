<template>
  <div class="grid-container">
    <div class="search-box">
      <div v-if="!props.hideName" class="grid-title-area">
        <slot name="name">
          <slot name="title">
            <span v-if="name" class="grid-title">{{ name }}</span>
          </slot>
        </slot>
      </div>

      <div class="grid-action-area">
        <div v-if="props.isSearch" class="search-input-wrapper">
          <input v-model="searchInputValue" placeholder="전체 검색..." />
        </div>
        <div class="action-buttons-wrapper">
          <slot name="btn-before" />
          <button v-if="props.isExcel" class="btn-action btn-secondary btn-excel" :disabled="isLoading" @click="downloadExcel">
            <svg class="excel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M8 13h2v5H8zM14 13h2v5h-2zM8 10h8v1H8z" />
            </svg>
            <span>{{ isLoading ? '처리 중...' : '엑셀 다운로드' }}</span>
          </button>
          <slot name="btn-after" />
        </div>
      </div>
    </div>

    <div ref="gridRef" class="v-grid-outer">
      <div v-if="isLoading" class="v-grid-loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-text">엑셀 파일을 생성하고 있습니다...</div>
      </div>

      <div class="v-thead-outer-wrapper" :style="{ paddingRight: `${scrollbarWidth}px` }">
        <div ref="headerWrapperRef" class="v-thead-wrapper" @scroll="syncXScroll('header')">
          <div class="v-thead" :style="tableStyle">
            <div v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="v-tr">
              <div v-if="props.isSelection" class="v-th v-th-checkbox">
                <label class="custom-checkbox">
                  <input
                    type="checkbox"
                    :checked="table.getIsAllRowsSelected()"
                    @change="table.getToggleAllRowsSelectedHandler()($event)"
                    aria-label="모든 행 선택"
                  />
                  <span class="checkbox-mark"></span>
                </label>
              </div>

              <div
                v-for="header in headerGroup.headers"
                :key="header.id"
                class="v-th"
                :data-column-id="header.column.id"
                :style="getColumnStyle(header.column)"
              >
                <div class="header-content" :class="{ 'is-sortable': header.column.getCanSort() }" @click="header.column.getToggleSortingHandler()?.($event)">
                  <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />

                  <span v-if="header.column.getCanSort()" class="sort-icon-wrapper">
                    <svg
                      v-if="table.getState().sorting[0]?.id === header.column.id && table.getState().sorting[0]?.desc === false"
                      class="sort-icon active"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M12 19V5M12 5L5 12M12 5L19 12" />
                    </svg>
                    <svg
                      v-else-if="table.getState().sorting[0]?.id === header.column.id && table.getState().sorting[0]?.desc === true"
                      class="sort-icon active"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M12 5v14M12 19l-7-7M12 19l7-7" />
                    </svg>
                    <svg v-else class="sort-icon default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                    </svg>
                  </span>
                </div>

                <div
                  v-if="header.column.getCanResize()"
                  class="resizer"
                  :class="{ 'is-resizing': header.column.getIsResizing() }"
                  @mousedown.stop.prevent="syncCurrentWidth(header, $event)"
                  @touchstart.stop.prevent="syncCurrentWidth(header, $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref="parentRef" class="v-grid-body-wrapper" @scroll="syncXScroll('body')">
        <div
          v-if="table.getRowModel().rows.length > 0"
          class="v-tbody-virtual-canvas"
          :style="{ width: tableStyle.width, height: `${rowVirtualizer.getTotalSize()}px` }"
        >
          <div
            v-for="virtualRow in rowVirtualizer.getVirtualItems()"
            :key="String(virtualRow.key)"
            class="v-tr"
            :class="{ 'is-selected': table.getRowModel().rows[virtualRow.index]?.getIsSelected() }"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }"
          >
            <div v-if="props.isSelection" class="v-td v-td-checkbox">
              <label class="custom-checkbox">
                <input
                  type="checkbox"
                  :checked="table.getRowModel().rows[virtualRow.index]?.getIsSelected()"
                  :disabled="!table.getRowModel().rows[virtualRow.index]?.getCanSelect()"
                  @change="table.getRowModel().rows[virtualRow.index]?.getToggleSelectedHandler()($event)"
                  aria-label="행 선택"
                />
                <span class="checkbox-mark"></span>
              </label>
            </div>

            <div
              v-for="cell in table.getRowModel().rows[virtualRow.index]?.getVisibleCells() ?? []"
              :key="cell.id"
              class="v-td"
              :style="getColumnStyle(cell.column)"
              @click="handleCellClick(cell, virtualRow.index)"
              @dblclick="startEdit(virtualRow.index, cell.column.id, cell.getValue(), cell.column.columnDef)"
            >
              <component
                v-if="isEditing(virtualRow.index, cell.column.id)"
                :is="cell.column.columnDef.editComponent"
                v-model="editingValue"
                @blur="stopEdit"
                @keydown.enter="stopEdit"
                class="v-grid-edit-input"
                v-focus
              />
              <FlexRender v-else :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </div>
          </div>
        </div>

        <div v-else class="v-tbody-empty" :style="{ width: tableStyle.width }">
          <slot name="empty">
            <slot name="no-data">
              <div class="empty-message-container">
                <span class="empty-text">{{ props.emptyText }}</span>
              </div>
            </slot>
          </slot>
        </div>
      </div>

      <div v-if="props.isPaging" class="v-grid-pagination">
        <div class="pagination-left-space"></div>

        <div class="pagination-buttons">
          <button @click="table.setPageIndex(0)" :disabled="!table.getCanPreviousPage()" aria-label="처음 페이지로 이동">«</button>
          <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" aria-label="이전 페이지로 이동">‹</button>

          <button
            v-for="page in visiblePages"
            :key="page"
            :class="{ 'is-active': table.getState().pagination.pageIndex === page - 1 }"
            @click="table.setPageIndex(page - 1)"
            :aria-label="`${page} 페이지로 이동`"
          >
            {{ page }}
          </button>

          <button @click="table.nextPage()" :disabled="!table.getCanNextPage()" aria-label="다음 페이지로 이동">›</button>
          <button @click="table.setPageIndex(table.getPageCount() - 1)" :disabled="!table.getCanNextPage()" aria-label="마지막 페이지로 이동">»</button>
        </div>

        <div class="pagination-size">
          <select
            :value="table.getState().pagination.pageSize"
            @change="table.setPageSize(Number(($event.target as HTMLSelectElement).value))"
            aria-label="페이지당 표시할 행 개수"
          >
            <option v-for="size in [10, 20, 30, 50, 100]" :key="size" :value="size">{{ size }}개씩 보기</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="TData extends object">
import { ref, computed, watch, useTemplateRef, shallowRef, h, onMounted, onUnmounted } from 'vue'
import { useExcel } from '@common/utils'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  FlexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/vue-table'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { watchDebounced } from '@vueuse/core'

const selected = defineModel<TData[]>('selected', { default: () => [] })
const changedRow = defineModel<TData[]>('changed', { default: () => [] })
const { exportJsonToExcel } = useExcel()

const props = withDefaults(
  defineProps<{
    data?: TData[]
    columns: any[]
    isPaging?: boolean
    isSelection?: boolean | ((row: TData) => boolean)
    isExcel?: boolean
    isSearch?: boolean
    hideName?: boolean
    name?: string
    emptyText?: string
  }>(),
  {
    data: () => [],
    isPaging: false,
    isSelection: false,
    isExcel: false,
    isSearch: true,
    hideName: false,
    name: 'grid_data',
    emptyText: '데이터가 없습니다.',
  },
)

const emit = defineEmits<{
  (e: 'click:cell', payload: { columnName: string; rowKey: number; row: TData; instance: any; value: any }): void
  (e: 'cellClick', payload: { columnName: string; rowKey: number; row: TData; instance: any; value: any }): void
  (e: 'click:row', payload: { rowKey: number; row: TData }): void
  (e: 'rowClick', payload: { rowKey: number; row: TData }): void
}>()

const handleCellClick = (cell: any, rowIndex: number) => {
  const columnName = cell.column.id || cell.column.columnDef.accessorKey
  const rowData = cell.row.original
  const payload = {
    columnName,
    rowKey: rowIndex,
    row: rowData,
    instance: table,
    value: cell.getValue(),
  }
  emit('click:cell', payload)
  emit('cellClick', payload)
}

const gridRef = useTemplateRef<HTMLDivElement>('gridRef')
const headerWrapperRef = useTemplateRef<HTMLDivElement>('headerWrapperRef')
const parentRef = useTemplateRef<HTMLDivElement>('parentRef')

const scrollbarWidth = ref(0)

const updateScrollbarWidth = () => {
  if (parentRef.value) {
    const sbw = parentRef.value.offsetWidth - parentRef.value.clientWidth
    scrollbarWidth.value = Math.max(0, sbw)
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateScrollbarWidth()
  if (parentRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateScrollbarWidth)
    resizeObserver.observe(parentRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(
  () => [props.data, props.columns],
  () => {
    requestAnimationFrame(updateScrollbarWidth)
  },
  { deep: true },
)

const sorting = ref<SortingState>([])
const rowSelection = ref<Record<string, boolean>>({})
const isLoading = ref(false)

const searchInputValue = ref('')
const globalFilter = ref('')

watchDebounced(
  () => searchInputValue.value,
  (newValue) => {
    globalFilter.value = newValue
    table.setGlobalFilter(newValue)
  },
  { debounce: 200 },
)

let activeDriver: 'header' | 'body' | null = null
let timeoutId: number | null = null

const syncXScroll = (source: 'header' | 'body') => {
  if (activeDriver && activeDriver !== source) return
  activeDriver = source

  if (source === 'header' && headerWrapperRef.value && parentRef.value) {
    parentRef.value.scrollLeft = headerWrapperRef.value.scrollLeft
  } else if (source === 'body' && parentRef.value && headerWrapperRef.value) {
    headerWrapperRef.value.scrollLeft = parentRef.value.scrollLeft
  }

  if (timeoutId) cancelAnimationFrame(timeoutId)
  timeoutId = requestAnimationFrame(() => {
    activeDriver = null
  })
}

const syncCurrentWidth = (header: any, event: any) => {
  if (!gridRef.value) return

  const thElements = gridRef.value.querySelectorAll('.v-th')
  const newSizes: Record<string, number> = {}

  // 1. Read Phase: Gather all sizes first to prevent layout thrashing
  thElements.forEach((el) => {
    const colId = el.getAttribute('data-column-id')
    if (colId) {
      newSizes[colId] = el.getBoundingClientRect().width
    }
  })

  // 2. Write Phase: Perform batch state updates outside the loop
  table.setColumnSizing((prev) => ({
    ...prev,
    ...newSizes,
  }))

  header.getResizeHandler()(event)
}

const totalHeadersLength = computed(() => table.getFlatHeaders().length)

const isPixelMode = computed(() => {
  const isResizing = table.getState().columnSizingInfo.isResizingColumn
  const sizingKeysLength = Object.keys(table.getState().columnSizing).length
  return isResizing || sizingKeysLength > 0 || totalHeadersLength.value > 10
})

const tableStyle = computed(() => ({
  width: isPixelMode.value ? `${table.getTotalSize()}px` : '100%',
}))

const getColumnStyle = (column: any) => {
  const align = column.columnDef.align
  const justifyContent = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
  const size = column.columnDef.size || column.getSize()
  const hasCustomWidth = Boolean(column.columnDef.width || (column.columnDef.size && column.columnDef.size !== 150))

  return {
    width: hasCustomWidth ? `${size}px` : isPixelMode.value ? `${size}px` : 'auto',
    flex: hasCustomWidth ? `0 0 ${size}px` : isPixelMode.value ? `0 0 ${size}px` : '1 1 0%',
    justifyContent,
    textAlign: align || 'left',
  }
}

const resolvedColumns = computed<ColumnDef<TData>[]>(() => {
  return props.columns.map((col, index) => {
    const fieldKey = (col.id || col.accessorKey || col.name || `col_${index}`) as string
    return {
      ...col,
      id: fieldKey,
      accessorKey: fieldKey,
      accessorFn: (row: any) => row[fieldKey],
      size: col.width || 150,
      width: col.width,
      align: col.align || 'left',
      editComponent: col.editComponent,
      cell: (cellProps: any) => {
        if (col.cell) {
          return typeof col.cell === 'function' ? col.cell(cellProps) : col.cell
        }
        const val = cellProps.row.original ? cellProps.row.original[fieldKey] : cellProps.getValue()
        if (col.formatter) {
          const formatted = col.formatter({ value: val, row: cellProps.row.original })
          if (typeof formatted === 'string' && formatted.includes('<')) {
            return h('span', { innerHTML: formatted })
          }
          return formatted
        }
        return cellProps.getValue() ?? val ?? ''
      },
    } as unknown as ColumnDef<TData>
  })
})

const internalData = shallowRef<TData[]>([])

watch(
  () => props.data,
  (newData) => {
    internalData.value = Array.isArray(newData) ? [...newData] : []
  },
  { immediate: true },
)

const forceTableRender = () => {
  internalData.value = [...internalData.value]
}

const tableData = computed<TData[]>(() => internalData.value)

const table = useVueTable<TData>({
  get data() {
    return tableData.value
  },
  get columns() {
    return resolvedColumns.value
  },
  state: {
    get sorting() {
      return sorting.value
    },
    get globalFilter() {
      return globalFilter.value
    },
    get rowSelection() {
      return rowSelection.value
    },
  },
  columnResizeMode: 'onChange',
  enableRowSelection: (row) => (typeof props.isSelection === 'function' ? props.isSelection(row.original) : props.isSelection),
  enableMultiRowSelection: true,
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: props.isPaging ? getPaginationRowModel() : undefined,
})

watch(
  () =>
    Object.keys(rowSelection.value)
      .filter((k) => rowSelection.value[k])
      .sort()
      .join(','),
  () => {
    selected.value = table.getSelectedRowModel().rows.map((row) => row.original)
  },
)

const visiblePages = computed(() => {
  const totalPages = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1
  const maxVisible = 5

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const rows = computed(() => table.getRowModel().rows)

const rowVirtualizer = useVirtualizer({
  get count() {
    return rows.value.length
  },
  getScrollElement: () => parentRef.value,
  estimateSize: () => 40,
  overscan: 20,
})

const editingCell = ref<{ rowIndex: number; columnId: string } | null>(null)
const editingValue = ref<any>(null)

const vFocus = {
  mounted: (el: HTMLElement) => {
    const input = el.querySelector('input, select, textarea') || el
    ;(input as HTMLElement).focus()
  },
}

const startEdit = (rowIndex: number, columnId: string, cellValue: any, columnDef: any) => {
  if (columnDef.editComponent) {
    editingCell.value = { rowIndex, columnId }
    editingValue.value = cellValue
  }
}

const isEditing = (rowIndex: number, columnId: string) => {
  return editingCell.value?.rowIndex === rowIndex && editingCell.value?.columnId === columnId
}

const stopEdit = () => {
  if (editingCell.value) {
    const { rowIndex, columnId } = editingCell.value
    const row = rows.value[rowIndex]

    if (row) {
      const previousValue = (row.original as any)[columnId]

      if (previousValue !== editingValue.value) {
        ;(row.original as any)[columnId] = editingValue.value

        const updatedRow = { ...row.original }
        let nextChanged = [...changedRow.value]

        const originalRow = props.data.find((r: any) => (r as any).id === (updatedRow as any).id)

        const isReverted =
          originalRow && Object.keys(updatedRow).every((key) => (updatedRow as Record<string, any>)[key] === (originalRow as Record<string, any>)[key])

        const existingIndex = nextChanged.findIndex((r: any) => (r as any).id === (updatedRow as any).id)

        if (isReverted) {
          if (existingIndex !== -1) {
            nextChanged.splice(existingIndex, 1)
          }
        } else {
          if (existingIndex !== -1) {
            nextChanged[existingIndex] = updatedRow
          } else {
            nextChanged.push(updatedRow)
          }
        }

        changedRow.value = nextChanged
        forceTableRender()
      }
    }
  }
  editingCell.value = null
}

const downloadExcel = () => {
  const selectedRows = table.getSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0
  const rowsToExport = hasSelection ? selectedRows : table.getFilteredRowModel().rows

  if (rowsToExport.length === 0) {
    console.warn('다운로드할 데이터가 없습니다.')
    return
  }

  isLoading.value = true

  setTimeout(() => {
    try {
      const headers = table.getFlatHeaders().map((h) => h.column.columnDef.header as string)
      const columnKeys = table.getFlatHeaders().map((h) => h.column.id)

      const excelData = rowsToExport.map((row) => {
        const rowData: Record<string, any> = {}
        columnKeys.forEach((key, index) => {
          const headerName = headers[index] || key
          rowData[headerName] = row.getValue(key)
        })
        return rowData
      })

      const excelFileName = hasSelection ? `${props.name}_selected` : props.name
      exportJsonToExcel(excelData, excelFileName, 'DataList')
    } catch (error) {
      console.error('Excel Export Error:', error)
    } finally {
      isLoading.value = false
    }
  }, 50)
}

defineExpose({
  table,
})
</script>

<style scoped>
.grid-container {
  padding: 12px 16px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}
.search-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
}
.grid-title-area {
  display: flex;
  align-items: center;
}
.grid-title {
  font-size: 17px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.3px;
}
.grid-action-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.search-input-wrapper input {
  padding: 7px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  font-size: 13.5px;
  width: 210px;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}
.search-input-wrapper input:focus {
  border-color: #059669;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}
.action-buttons-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-action {
  padding: 7px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-secondary {
  background-color: #fff;
  border-color: #cbd5e1;
  color: #475569;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}
.btn-secondary:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #94a3b8;
  color: #1e293b;
}
.btn-primary {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 14px rgba(52, 211, 153, 0.4);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 18px rgba(52, 211, 153, 0.5);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
.btn-excel {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #cbd5e1;
  background-color: #fff;
  color: #475569;
  transition: all 0.2s ease;
}
.btn-excel:hover:not(:disabled) {
  background-color: #f0fdf4;
  border-color: #16a34a;
  color: #16a34a;
}
.btn-excel:disabled {
  background-color: #f1f5f9;
  color: #cbd5e1;
  border-color: #e2e8f0;
  cursor: not-allowed;
}
.excel-icon {
  width: 15px;
  height: 15px;
  color: #16a34a;
}
.btn-excel:disabled .excel-icon {
  color: #cbd5e1;
}
.v-grid-outer {
  width: 100%;
  flex: 1;
  height: 100%;
  min-height: 0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}
.v-grid-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 99;
  gap: 12px;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-text {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.v-thead-outer-wrapper {
  display: flex;
  width: 100%;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
  box-sizing: border-box;
}
.v-thead-wrapper {
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.v-thead-wrapper::-webkit-scrollbar {
  display: none;
}
.v-thead {
  display: flex;
}
.v-grid-body-wrapper {
  width: 100%;
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;
}
.v-tbody-virtual-canvas {
  position: relative;
  box-sizing: border-box;
}
.v-tr {
  display: flex;
  width: 100%;
  box-sizing: border-box;
}
.v-tbody-virtual-canvas .v-tr {
  will-change: transform;
  contain: layout paint;
}
.v-tr.is-selected .v-td {
  background-color: #f8fafc;
}
.v-th,
.v-td {
  box-sizing: border-box;
  flex: none;
  padding: 10px 8px;
  text-align: left;
  border-right: 1px solid #ddd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  position: relative;
}
.v-th-checkbox,
.v-td-checkbox {
  width: 44px;
  flex: none;
  justify-content: center;
  align-items: center;
}
.v-td {
  border-bottom: 1px solid #ddd;
  background-color: #fff;
}
.v-th {
  font-weight: 600;
  user-select: none;
}
.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  width: 18px;
  height: 18px;
  user-select: none;
}
.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}
.checkbox-mark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 1.5px solid #cbd5e1;
  border-radius: 4px;
  transition: all 0.15s ease;
}
.custom-checkbox:hover input ~ .checkbox-mark {
  border-color: #94a3b8;
}
.custom-checkbox input:checked ~ .checkbox-mark {
  background-color: #2563eb;
  border-color: #2563eb;
}
.checkbox-mark:after {
  content: '';
  position: absolute;
  display: none;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.custom-checkbox input:checked ~ .checkbox-mark:after {
  display: block;
}
.custom-checkbox input:indeterminate ~ .checkbox-mark {
  background-color: #2563eb;
  border-color: #2563eb;
}
.custom-checkbox input:indeterminate ~ .checkbox-mark:after {
  display: block;
  left: 4px;
  top: 7px;
  width: 8px;
  height: 2px;
  border: solid white;
  border-width: 0 0 2px 0;
  transform: rotate(0deg);
}
.custom-checkbox input:disabled ~ .checkbox-mark {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
  cursor: not-allowed;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: inherit;
  width: 100%;
  gap: 4px;
}
.header-content.is-sortable {
  cursor: pointer;
}
.sort-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.sort-icon {
  width: 14px;
  height: 14px;
}
.sort-icon.default {
  color: #bbb;
}
.sort-icon.active {
  color: #2563eb;
}
.resizer {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 8px;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  z-index: 10;
}
.resizer::after {
  content: '';
  display: block;
  width: 2px;
  height: 100%;
  background: transparent;
  margin-left: auto;
  transition: background 0.1s;
}
.resizer:hover::after,
.resizer.is-resizing::after {
  background: #2563eb;
}
.v-grid-pagination {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: #fafafa;
  border-top: 1px solid #ddd;
  flex-shrink: 0;
}
.pagination-left-space {
  flex: 1;
  flex-basis: 0;
}
.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  justify-content: center;
}
.pagination-buttons button {
  padding: 4px 10px;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  min-width: 32px;
  text-align: center;
}
.pagination-buttons button.is-active {
  background-color: #2563eb;
  color: #fff;
  border-color: #2563eb;
  font-weight: bold;
}
.pagination-buttons button:disabled {
  background-color: #f0f0f0;
  color: #aaa;
  cursor: not-allowed;
}
.pagination-size {
  flex: 1;
  flex-basis: 0;
  display: flex;
  justify-content: flex-end;
}
.pagination-size select {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}
.v-grid-edit-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;
  z-index: 1;
}

.v-tbody-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  height: 200px;
  width: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}
.empty-message-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  user-select: none;
}
.empty-text {
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}
</style>
