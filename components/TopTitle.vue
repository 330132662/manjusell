<template>
  <text class="gradient-text" @click="handleClick">{{ title }}</text>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'AI短剧学院'
  }
})

const handleClick = () => {
  uni.navigateTo({
    url: '/pages/home/index'
  })
}
</script>

<style lang="scss" scoped>
.gradient-text {
  background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  letter-spacing: -0.02em;
  font-size: 20px;
}
</style>