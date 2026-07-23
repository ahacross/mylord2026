export interface PracticeSong {
  praised_day: string
  title: string
  description: string
  practice_url: string // 콤마(,)로 분리된 YouTube URL들
}

export interface Songyoung {
  title: string
  description: string
  url: string[] // YouTube URL 배열 [소프라노, 알토, 테너, 베이스]
}

export interface BirthdayMember {
  name: string
  birthday: string // 예: 19991231 또는 1231 등
}

export interface Part {
  text: string
  short: string
}
