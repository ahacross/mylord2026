<template>
  <defaultLayout>
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </defaultLayout>

  <ModalsContainer />
</template>

<script setup lang="ts">
import { ModalsContainer } from '@common/form/dialog'
import defaultLayout from '@/layout/default.vue'
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
}

/* 페이드 트랜지션 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
