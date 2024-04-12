<!-- 顶部导航栏 -->
<template>
<div>
  <van-nav-bar :title="$route.meta.title" @click-left="goBack" @click-right="openCount">
    <template #left v-if="showBack">
      <van-icon name="arrow-left" size="20" color="#323233" />
      <span>返回</span>
    </template>
    <template #right v-if="showCount">
      <van-icon name="notes-o" size="20" color="#323233" />
      <span>&nbsp;统计</span>
    </template>
  </van-nav-bar>
</div>
</template>
<script>
import * as dd from 'dingtalk-jsapi'
import { closeDD } from '@/utils/dingding.js'
export default {
  components: {},
  data() {
    return {
    }
  },
  computed: {
    showBack() {
      // return this.$route.name === 'Location' || this.$route.name === 'Count'
      return ['Location', 'Count', 'Inside', 'Outside', 'CarNo'].includes(this.$route.name)
    },
    showCount() {
      return this.$route.name === 'Outside' || this.$route.name === 'Inside'
    }
  },
  created() {},
  mounted() {},
  methods: {
    openCount() {
      this.$router.push({ name: 'Count' })
    },
    goBack() {
      if (['Inside', 'Outside'].includes(this.$route.name)) {
        if (dd.env.platform === 'notInDingTalk') {
          return
        } else {
          closeDD()
        }
      } else {
        if (this.$store.state.app.isMap === 1 || this.$store.state.app.isMap === '') {
          this.$store.dispatch('setIsMap', 1)
          this.$router.back()
        } else {
          this.$router.replace({
            name: this.$store.state.app.isMap
          })
          this.$router.go(-1)
        }
      }
    }
  }
}
</script>

<style scoped>
</style>
