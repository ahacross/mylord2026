export interface ExcelColumn {
  headerName: string
  field: string
}

export function useExcel() {
  async function convertExcelToJson<T = any>(
    file: File,
    columns: ExcelColumn[],
    columnFn: (data: any[]) => T[],
  ): Promise<T[]> {
    // xlsx 라이브러리를 동적으로 로딩
    const { read, utils } = await import('xlsx')

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const result = e.target?.result
          if (!result) return reject([])
          const data = new Uint8Array(result as ArrayBuffer)
          const wb = read(data, { type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd' })

          if (wb.SheetNames.length === 0) {
            return reject([])
          }

          const firstSheetName = wb.SheetNames[0]
          const worksheet = wb.Sheets[firstSheetName]

          const excelHeader = utils.sheet_to_json<any[]>(worksheet, { header: 1 })[0]

          const checkExcelHeader = columns.map(({ headerName }) => headerName)
          const fieldHeader = columns.map(({ field }) => field)

          if (JSON.stringify(checkExcelHeader) === JSON.stringify(excelHeader)) {
            const jsonData = utils.sheet_to_json<any>(worksheet, { header: fieldHeader })
            jsonData.shift() // 첫 번째 헤더 라인 제거
            resolve(columnFn(jsonData))
          } else {
            reject([])
          }
        } catch {
          reject([])
        }
      }

      reader.onerror = () => {
        reject([])
      }
      reader.readAsArrayBuffer(file)
    })
  }

  async function exportJsonToExcel(
    data: Record<string, any>[],
    fileName: string,
    sheetName: string = 'Sheet1',
  ) {
    // xlsx 라이브러리를 동적으로 로딩
    const { utils, writeFile } = await import('xlsx')

    const worksheet = utils.json_to_sheet(data)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, sheetName)
    writeFile(workbook, `${fileName}.xlsx`)
  }

  return {
    convertExcelToJson,
    exportJsonToExcel,
  }
}
