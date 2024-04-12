// 兼容 IE
// https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md#babelpolyfill
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'


import { encryptDes, decryptDes } from './utils/des'

// 设置 js中可以访问 $cdn
import { $cdn } from '@/config'
Vue.prototype.$cdn = $cdn

Vue.prototype.$encryptDes = encryptDes
Vue.prototype.$decryptDes = decryptDes

// 全局引入按需引入UI库 vant
import '@/plugins/vant'
// 引入全局样式
import '@/assets/css/index.scss'
// 移动端适配
import 'lib-flexible/flexible.js'
// v-calendar组件
// import VCalendar from 'v-calendar'
// Vue.use(VCalendar, {
//   componentPrefix: 'vc'
// })

// filters
import './filters'
Vue.config.productionTip = false

import * as dd from 'dingtalk-jsapi'
// 隐藏钉钉导航栏
if (dd.env.platform !== 'notInDingTalk') {
  dd.biz.navigation.hideBar({
    hidden: true, // true：隐藏，false：显示
    onSuccess: function(result) {},
    onFail: function(err) {
      console.log(err)
    }
  })
}

import preventReClick from './utils/preventReClick'
Vue.use(preventReClick)

window.addEventListener('contextmenu', function(e) {
  e.preventDefault()
})
document.oncopy = function() {
  return false
}

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
