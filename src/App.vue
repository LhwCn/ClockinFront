<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import { getDdPermission } from '@/api/clock.js'
import * as dd from 'dingtalk-jsapi'
export default {
  name: 'App',
  mounted() {
    if (dd.env.platform !== 'notInDingTalk') {
      const params = {
        sendBy: '501905df0b924bea868011f70a6f4dc3', // 正式
        url: location.href.split('#')[0]
      }
      debugger
      getDdPermission(params)
        .then((data) => {
          console.log(data)
          debugger
          if (data.code === 200) {
            debugger
            // this.$store.dispatch('setPermission', data.body)
            // alert(JSON.stringify(data.body))
            // 调用定位之前需要鉴权
            dd.config({
              agentId: data.body.agentId, // 必填，微应用ID
              corpId: 'dingf7008cef3c792395f2c783f7214b6d69', // 必填，企业ID
              timeStamp: data.body.timeStamp, // 必填，生成签名的时间戳
              nonceStr: data.body.nonceStr, // 必填，自定义固定字符串。
              signature: data.body.signature, // 必填，签名
              type: 0, // 选填。0表示微应用的jsapi,1表示服务窗的jsapi；默认为0。该参数从dingtalk.js的0.8.3版本开始支持
              jsApiList: [
                'device.geolocation.get',
                'device.geolocation.start',
                'device.geolocation.stop'
              ] // 申请鉴权使用的jsapi列表
            })
            // 该方法必须带上，用来捕获鉴权出现的异常信息，否则不方便排查出现的问题
            dd.error(function(err) {
              // alert('dd error: ' + JSON.stringify(err))
              this.$toast('dd error: ' + JSON.stringify(err))
            })
          } else {
            this.$toast(data.message)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
}
</script>
<style lang="scss"></style>
