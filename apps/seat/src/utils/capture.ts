import html2canvas from 'html2canvas'

export const captureToBlob = async (dom: HTMLElement): Promise<Blob | null> => {
  // 캡처하는 찰나의 순간에 maxWidth와 overflowX를 무력화하고 강제로 전체 스크롤 크기만큼 물리적 너비를 넓혀
  // html2canvas가 부모 박스의 클리핑 한계선(max-width)에 걸려 우측이 잘리는 현상을 완벽히 방지함
  const originalWidth = dom.style.width
  const originalMaxWidth = dom.style.maxWidth
  const originalOverflowX = dom.style.overflowX
  
  const scrollWidth = dom.scrollWidth
  const scrollHeight = dom.scrollHeight
  
  dom.style.width = `${scrollWidth}px`
  dom.style.maxWidth = 'none'
  dom.style.overflowX = 'visible'
  
  try {
    const canvas = await html2canvas(dom, {
      width: scrollWidth,        // 전체 스크롤 영역 너비 렌더링
      height: scrollHeight,      // 전체 스크롤 영역 높이 렌더링
      scrollX: 0,
      scrollY: 0,
      windowWidth: scrollWidth,   // 가상 브라우저 너비를 전체 스크롤 영역 너비로 강제 고정
      windowHeight: scrollHeight,
      scale: 2,                   // 이미지 화질 2배 스케일업
      backgroundColor: '#ffffff', // 배경 불투명 화이트 설정
      useCORS: true,              // 외부 자원 CORS 사용 허용
      logging: false,             // 노이즈 제거
    })
    
    // 캡처 완료 즉시 원래 스크롤 및 너비 상태로 원상 복구
    dom.style.width = originalWidth
    dom.style.maxWidth = originalMaxWidth
    dom.style.overflowX = originalOverflowX
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  } catch (error) {
    // 에러 발생 시에도 복구 보장
    dom.style.width = originalWidth
    dom.style.maxWidth = originalMaxWidth
    dom.style.overflowX = originalOverflowX
    console.error('HTML5 Canvas capture error:', error)
    return null
  }
}
