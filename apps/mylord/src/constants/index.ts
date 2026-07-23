export interface MemberStatusItem {
  label: string
  value: string
}

export interface PartShortItem {
  text: string
  part: string
}

export interface PartMapAttr {
  at: number
  short: string
}

export interface PartListItem extends PartMapAttr {
  text: string
}

export const memberStatus: MemberStatusItem[] = [
  { label: '활동중', value: 'Y' },
  { label: '장기결석', value: 'R' },
  { label: '기타(탈퇴)', value: 'N' },
]

export const memberStatusMap: Map<string, string> = memberStatus.reduce((map, { label, value }) => {
  map.set(value, label)
  return map
}, new Map<string, string>())

export const parts: string[] = ['합창', '소프라노', '알토', '테너', '베이스']

export const partsShort: PartShortItem[] = [
  { text: '전체', part: 'all' },
  { text: '솦', part: 's' },
  { text: '알토', part: 'a' },
  { text: '테너', part: 't' },
  { text: '벵', part: 'b' },
  { text: '그외', part: 'e' },
]

export const partMap: Map<string, PartMapAttr> = new Map<string, PartMapAttr>()
partMap.set('합창', { at: 0, short: 'mp' })
partMap.set('소프라노', { at: 1, short: 'ss' })
partMap.set('알토', { at: 2, short: 'aa' })
partMap.set('테너', { at: 3, short: 'tt' })
partMap.set('베이스', { at: 4, short: 'bb' })

export const partList: PartListItem[] = Array.from(partMap, ([text, attr]) => ({
  text,
  ...attr,
}))
