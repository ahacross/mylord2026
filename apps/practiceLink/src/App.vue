<template>
  <component :is="layoutComponent">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" v-if="route.meta?.isDetail" :key="route.path" />
        <keep-alive v-else :max="10">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </component>

  <ModalsContainer />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ModalsContainer } from '@common/form/dialog'
import layouts from '@/layout/layouts'

const route = useRoute()

const layoutComponent = computed(
  () => layouts[(route?.meta?.layout || 'default') as keyof typeof layouts],
)
</script>
