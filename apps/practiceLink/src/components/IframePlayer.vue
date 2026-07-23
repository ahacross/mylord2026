<template>
  <div v-if="youtubeSrc" class="player-wrapper">
    <div class="player-container">
      <iframe
        :src="youtubeSrc"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        title="YouTube video player"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src?: string
}>()

const youtubeSrc = computed(() => {
  const src = props.src
  if (!src) return ''

  let videoId = ''
  try {
    if (src.includes('youtu.be/')) {
      // https://youtu.be/xxxxxx 형식 대응
      const parts = src.split('youtu.be/')
      videoId = parts[1]?.split(/[?#]/)[0] || ''
    } else if (src.includes('v=')) {
      // https://www.youtube.com/watch?v=xxxxxx 형식 대응
      const urlParams = new URLSearchParams(src.split('?')[1])
      videoId = urlParams.get('v') || ''
    } else if (src.includes('embed/')) {
      // https://www.youtube.com/embed/xxxxxx 형식 대응
      const parts = src.split('embed/')
      videoId = parts[1]?.split(/[?#]/)[0] || ''
    } else {
      videoId = src.trim()
    }
  } catch (e) {
    console.error('YouTube URL 파싱 에러:', e)
    videoId = src
  }

  if (!videoId) return ''
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&playsinline=1`
})
</script>

<style scoped>
.player-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto 2rem;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 25px rgba(16, 185, 129, 0.15); /* 에메랄드 네온 글로우 */
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: float-in 0.8s ease-out;
}

.player-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 비율 유지 */
  height: 0;
  overflow: hidden;
  border-radius: 14px;
  background: #000;
}

.player-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
