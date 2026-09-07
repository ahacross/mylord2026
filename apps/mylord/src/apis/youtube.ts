import axios from 'axios'

export interface YouTubeSearchResult {
  videoId: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string
  channelTitle: string
  shareUrl: string
}

const STORAGE_KEY_API_KEY = 'mylord_youtube_api_key'
const STORAGE_KEY_SEARCH_PREFIX = 'mylord_youtube_search_prefix'

// 기본 검색 접두어
export const DEFAULT_SEARCH_PREFIX = '100주년기념교회 마이로드'

export const getStoredApiKey = (): string => {
  return (import.meta.env.VITE_YOUTUBE_API_KEY as string) || localStorage.getItem(STORAGE_KEY_API_KEY) || ''
}

export const setStoredApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim())
  } else {
    localStorage.removeItem(STORAGE_KEY_API_KEY)
  }
}

export const getStoredSearchPrefix = (): string => {
  const prefix = localStorage.getItem(STORAGE_KEY_SEARCH_PREFIX)
  if (!prefix || prefix === '마이로드') {
    return DEFAULT_SEARCH_PREFIX
  }
  return prefix
}

export const setStoredSearchPrefix = (prefix: string): void => {
  localStorage.setItem(STORAGE_KEY_SEARCH_PREFIX, prefix.trim())
}

/**
 * 곡 제목과 부른 날짜를 기반으로 YouTube 검색어 조합 생성
 * 기본 형태: "100주년기념교회 마이로드 [곡명]"
 */
export const buildSearchQuery = (title: string, dateStr?: string, customPrefix?: string): string => {
  const prefix = customPrefix !== undefined ? customPrefix : getStoredSearchPrefix()
  let query = ''

  if (prefix) {
    query += `${prefix.trim()} `
  }

  if (title) {
    query += `${title.trim()}`
  }

  return query.trim()
}

/**
 * YouTube Data API v3를 통한 동영상 검색
 */
export const searchYoutubeVideos = async (
  query: string,
  apiKey?: string,
  maxResults = 5,
): Promise<YouTubeSearchResult[]> => {
  const key = (apiKey || getStoredApiKey()).trim()
  if (!key) {
    throw new Error('YouTube API Key가 설정되지 않았습니다. API 키를 먼저 입력해주세요.')
  }

  if (!query.trim()) {
    return []
  }

  const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults,
      key,
    },
  })

  if (!response.data?.items) {
    return []
  }

  return response.data.items.map((item: any) => {
    const videoId = item.id.videoId
    // HTML 엔티티 디코딩 (예: &amp; -> &)
    const title = decodeHtmlEntities(item.snippet.title)
    const description = decodeHtmlEntities(item.snippet.description)

    return {
      videoId,
      title,
      description,
      thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      shareUrl: `https://youtu.be/${videoId}`,
    }
  })
}

export interface SearchRankingCriteria {
  book?: string
  title?: string
  part?: string
  query?: string
}

/**
 * 유튜브 검색 결과를 책이름, 곡명, 파트(합창=SATB) 유사도 기반으로 재정렬
 */
export const rankYoutubeSearchResults = (
  results: YouTubeSearchResult[],
  criteria: SearchRankingCriteria,
): YouTubeSearchResult[] => {
  if (!results || results.length === 0) return []

  const scored = results.map((item, originalIndex) => {
    const score = calculateMatchScore(item, criteria)
    return { item, score, originalIndex }
  })

  // 점수 높은 순 정렬 (동점인 경우 원래 유튜브 검색 순위 유지)
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return a.originalIndex - b.originalIndex
  })

  return scored.map((s) => s.item)
}

/**
 * 영상 항목과 검색 조건 간의 유사도 점수 계산
 */
const calculateMatchScore = (item: YouTubeSearchResult, criteria: SearchRankingCriteria): number => {
  let score = 0
  const titleLower = (item.title || '').toLowerCase()
  const descLower = (item.description || '').toLowerCase()
  const fullTextLower = `${titleLower} ${descLower}`
  const titleNoSpace = titleLower.replace(/\s+/g, '')

  // 1. 책 정보(시리즈명 + 집/권/장 번호) 유사도 스코어링
  if (criteria.book && criteria.book.trim()) {
    // 괄호 및 괄호 안의 내용 제거 (소괄호, 대괄호, 중괄호 등)
    const cleanBook = criteria.book
      .replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g, ' ')
      .replace(/\r?\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // 집/권/장 번호 추출 (예: "중앙성가 38집" -> "38")
    const volMatch = cleanBook.match(/(\d+)\s*(?:집|권|장|호|탄|vol|volume)?/i)
    const targetVol = volMatch ? volMatch[1] : null

    // 책 시리즈명 추출 (숫자 및 권/집/번 단위 제외)
    const targetSeries = cleanBook
      .replace(/\d+\s*(?:집|권|장|호|탄|vol|volume|번)?/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()

    // 1-1. 책 시리즈명 매칭
    if (targetSeries && targetSeries.length >= 2) {
      const targetSeriesNoSpace = targetSeries.replace(/\s+/g, '')
      if (titleLower.includes(targetSeries) || titleNoSpace.includes(targetSeriesNoSpace)) {
        score += 45
      } else if (descLower.includes(targetSeries)) {
        score += 20
      }
    }

    // 1-2. 집/권수 번호 매칭 & 상이한 집수 감점
    if (targetVol) {
      // 영상 제목에서 집/권수 패턴 검사
      const volPattern = new RegExp(`(?:^|[^0-9])(${targetVol})\\s*(?:집|권|장|호|탄|vol|volume|번)?(?:[^0-9]|$)`, 'i')
      const explicitVolPattern = new RegExp(`(?:^|[^0-9])(${targetVol})\\s*(?:집|권|vol|volume)`, 'i')

      if (explicitVolPattern.test(titleLower)) {
        score += 55 // 명확한 집수 일치 (예: "38집")
      } else if (volPattern.test(titleLower)) {
        score += 35 // 번호 일치
      } else if (explicitVolPattern.test(descLower)) {
        score += 20
      }

      // 만약 영상 제목에 다른 집수(예: 38집을 찾는데 25집, 35집 등)가 명시된 경우 큰 감점
      const otherVolMatch = titleLower.match(/(\d+)\s*(?:집|권|vol|volume)/i)
      if (otherVolMatch && otherVolMatch[1] !== targetVol) {
        score -= 70 // 책의 다른 집수 영상 감점
      }
    }
  }

  // 2. 곡명(Title) 유사도 스코어링
  if (criteria.title && criteria.title.trim()) {
    const targetTitle = criteria.title.trim().toLowerCase()
    const targetTitleNoSpace = targetTitle.replace(/\s+/g, '')

    if (titleLower.includes(targetTitle)) {
      score += 50
    } else if (titleNoSpace.includes(targetTitleNoSpace)) {
      score += 45
    } else {
      // 단어 단위 매칭
      const words = targetTitle.split(/\s+/).filter((w) => w.length >= 2)
      if (words.length > 0) {
        const matchedWords = words.filter((w) => titleLower.includes(w))
        const matchRatio = matchedWords.length / words.length
        score += Math.round(matchRatio * 35)

        // 핵심 단어가 하나도 없으면 다른 곡일 확률 높음
        if (matchedWords.length === 0) {
          score -= 50
        }
      }
    }
  }

  // 3. 파트(Part) 스코어링: 합창 = SATB 동등 취급 & 파트 일치도
  if (criteria.part) {
    const partNorm = criteria.part.trim().toLowerCase()
    const isChorusTarget =
      partNorm === '합창' ||
      partNorm === 'satb' ||
      partNorm === 'all' ||
      partNorm === '전체'

    const CHORUS_REGEX = /(?:합창|satb|s\.a\.t\.b|s\s*a\s*t\s*b|전체\s*(?:파트|음원|합창)?|혼성\s*합창|혼성)/i
    const SOP_REGEX = /(?:소프라노|soprano|sop\b|솦)/i
    const ALTO_REGEX = /(?:알토|alto\b)/i
    const TENOR_REGEX = /(?:테너|tenor\b)/i
    const BASS_REGEX = /(?:베이스|bass\b|벵)/i

    if (isChorusTarget) {
      // 합창 검색 시: '합창' 또는 'SATB' 키워드 가점
      if (CHORUS_REGEX.test(titleLower)) {
        score += 45
      } else if (CHORUS_REGEX.test(descLower)) {
        score += 20
      }

      // 합창을 찾는데 소프라노/알토/테너/베이스 단독 파트만 명시된 경우 큰 감점
      const isSinglePart =
        (SOP_REGEX.test(titleLower) ||
          ALTO_REGEX.test(titleLower) ||
          TENOR_REGEX.test(titleLower) ||
          BASS_REGEX.test(titleLower)) &&
        !CHORUS_REGEX.test(titleLower)

      if (isSinglePart) {
        score -= 65
      }
    } else if (partNorm.includes('소프라노') || partNorm === 'sop') {
      if (SOP_REGEX.test(titleLower)) score += 45
      else if (SOP_REGEX.test(descLower)) score += 20

      // 타 파트만 명시된 경우 감점
      if ((ALTO_REGEX.test(titleLower) || TENOR_REGEX.test(titleLower) || BASS_REGEX.test(titleLower)) && !SOP_REGEX.test(titleLower)) {
        score -= 50
      }
      if (CHORUS_REGEX.test(titleLower) && !SOP_REGEX.test(titleLower)) {
        score -= 25
      }
    } else if (partNorm.includes('알토') || partNorm === 'alto') {
      if (ALTO_REGEX.test(titleLower)) score += 45
      else if (ALTO_REGEX.test(descLower)) score += 20

      if ((SOP_REGEX.test(titleLower) || TENOR_REGEX.test(titleLower) || BASS_REGEX.test(titleLower)) && !ALTO_REGEX.test(titleLower)) {
        score -= 50
      }
      if (CHORUS_REGEX.test(titleLower) && !ALTO_REGEX.test(titleLower)) {
        score -= 25
      }
    } else if (partNorm.includes('테너') || partNorm === 'tenor') {
      if (TENOR_REGEX.test(titleLower)) score += 45
      else if (TENOR_REGEX.test(descLower)) score += 20

      if ((SOP_REGEX.test(titleLower) || ALTO_REGEX.test(titleLower) || BASS_REGEX.test(titleLower)) && !TENOR_REGEX.test(titleLower)) {
        score -= 50
      }
      if (CHORUS_REGEX.test(titleLower) && !TENOR_REGEX.test(titleLower)) {
        score -= 25
      }
    } else if (partNorm.includes('베이스') || partNorm === 'bass') {
      if (BASS_REGEX.test(titleLower)) score += 45
      else if (BASS_REGEX.test(descLower)) score += 20

      if ((SOP_REGEX.test(titleLower) || ALTO_REGEX.test(titleLower) || TENOR_REGEX.test(titleLower)) && !BASS_REGEX.test(titleLower)) {
        score -= 50
      }
      if (CHORUS_REGEX.test(titleLower) && !BASS_REGEX.test(titleLower)) {
        score -= 25
      }
    }
  } else {
    // 파트가 없는 경우 (부른 음원 메인 영상 등): 성가대 관련 키워드 가점
    if (/(?:마이로드|100주년기념교회|100주년|주일찬양대|성가대)/i.test(fullTextLower)) {
      score += 30
    }
  }

  // 4. 수동 입력 검색어(query)와의 추가 토큰 매칭 가점
  if (criteria.query && criteria.query.trim()) {
    const tokens = criteria.query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 2)
    for (const token of tokens) {
      if (titleLower.includes(token)) {
        score += 8
      }
    }
  }

  return score
}

/**
 * 파트 검색어 조합 생성
 * 합창인 경우 "합창 SATB"를 포함하여 유튜브가 두 키워드 모두 넓게 검색하도록 지원
 */
export const buildPartSearchQuery = (title: string, desc: string, partName: string): string => {
  // 괄호 및 괄호 안의 내용 제거 (소괄호, 대괄호, 중괄호 등)
  const cleanDesc = desc
    ? desc
        .replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g, ' ')
        .replace(/\r?\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : ''
  const cleanTitle = title ? title.trim() : ''
  const searchPart = partName === '합창' ? '합창 SATB' : partName
  return [cleanDesc, cleanTitle, searchPart].filter(Boolean).join(' ').trim()
}

const decodeHtmlEntities = (text: string): string => {
  if (typeof window === 'undefined' || !text) return text
  const parser = new DOMParser()
  const dom = parser.parseFromString(`<!doctype html><body>${text}`, 'text/html')
  return dom.body.textContent || text
}

