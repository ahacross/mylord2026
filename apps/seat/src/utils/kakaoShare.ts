declare global {
  interface Window {
    Kakao: any
  }
}

export const Share = {
  async uploadImage(file: File): Promise<string> {
    const res = await window.Kakao.Share.uploadImage({ file: [file] })
    return res.infos.original.url
  },
  shareContent(title: string, url: string): void {
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        imageUrl: url,
        link: {
          mobileWebUrl: url,
          webUrl: url
        }
      }
    })
  }
}
