export const useUtil = {
  delay: (time: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, time)),
  genId: (length: number = 7, str: string = ''): string =>
    `${str}${Math.random()
      .toString(36)
      .substring(2, length + 2)}`,
  comma: (num: number | string): string => {
    const parsed = typeof num === 'string' ? parseFloat(num) : num
    return isNaN(parsed) ? '0' : parsed.toLocaleString()
  },
}
