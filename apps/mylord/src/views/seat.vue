<template>
  <div></div>
</template>

<script setup>
definePage({
  name: 'seat',
  meta: { requiresAuth: false },
  beforeEnter: () => {
    window.open('https://ahacross.me/seat', '_blank')
    return false
  },
})
</script>
