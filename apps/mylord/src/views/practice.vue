<template>
  <div></div>
</template>

<script setup>
definePage({
  name: 'practice',
  meta: { requiresAuth: false },
  beforeEnter: () => {
    window.open('https://ahacross.me/practiceLink/', '_blank')
    return false
  },
})
</script>
