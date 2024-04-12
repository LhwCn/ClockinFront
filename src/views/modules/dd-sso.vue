<!--
 * @Description: 钉钉单点页面
-->
<template>
  <div class="sso">
    <!-- <van-loading size="60px" /> -->
  </div>
</template>
<script>
import qs from 'qs'
import { getCode, closeDD } from '@/utils/dingding.js'
import { getDdToken } from '@/api/clock.js'

export default {
  components: {},
  data() {
    return {}
  },
  created() {},
  mounted() {

    this.doSSOLogin()
  },
  methods: {
    // 业务系统定制开发code换取钉钉用户信息接口，完成登录认证
    doSSOLogin() {
      debugger
      const _this = this
      getCode(code => {
        const loginForm = {
          'code': code,
          'sendBy': '501905df0b924bea868011f70a6f4dc3'
        }

        getDdToken(qs.stringify(loginForm))
          .then((data) => {
            if (data.code === 200) {
              _this.$store.dispatch('setToken', data.access_token)
              this.$router.replace({
                name: 'Inside'
              })
            } else {
              this.$router.replace({
                name: 'Login'
              })
            }
          })
          .catch(err => {
            alert(err);
            closeDD()
          })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.sso {
  height: 100vh;
  display: flex;
  flex-flow: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  margin-top: 0;
  overflow: hidden;
}
</style>
