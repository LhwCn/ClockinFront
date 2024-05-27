<template>
  <div class="app-container">
    <div class="layout-header">
      <van-sticky>
        <NavBar />
      </van-sticky>
    </div>
    <div class="layout-content">
      <keep-alive v-if="$route.meta.keepAlive">
        <router-view></router-view>
      </keep-alive>
      <router-view v-else></router-view>
    </div>
    <div class="layout-footer" v-if="showTabbar">
      <TabBar :data="tabbars" @change="handleChange" />
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'
import TabBar from '@/components/TabBar'
export default {
  name: 'AppLayout',
  data() {
    return {
      tabbars: [
        {
          title: '',
          to: {
            name: 'Inside'
          },
          //icon: 'location-o'
        }
        // {
        //   title: '车牌管理',
        //   to: {
        //     name: 'CarNo'
        //   },
        //   icon: 'logistics'
        // }
      ]
    }
  },
  components: {
    TabBar,
    NavBar
  },
  computed: {
    showTabbar() {
      return !(['Location', 'Count', 'LastRecord', 'Login', 'DdSso'].includes(this.$route.name))
    }
  },
  methods: {
    handleChange(v) {
      console.log('tab value:', v)
    }
  }
}
</script>
