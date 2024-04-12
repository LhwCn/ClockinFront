/*
 * @Description: 钉钉单点相关
 */
import * as dd from 'dingtalk-jsapi'
export function getCode(callback) {
  const corpId = 'dingf7008cef3c792395f2c783f7214b6d69'
  dd.ready(function() {
    dd.runtime.permission.requestAuthCode({
      corpId: corpId, // 联系项目组获取corpId
      onSuccess: function(result) {
        // 根据钉钉提供的api 获得code后,再次调用这个callback方法
        // 由于是钉钉获取code是异步操作,不知道什么时候执行完毕
        // callback 函数会等他执行完毕后在自己调用自己
        // code登录码
        callback(result.code)
      },
      onFail: function(err) {
        alert('获取钉钉code失败' + JSON.stringify(err))
        setTimeout(() => {
          closeDD()
        }, 2000)
      }
    })
  })
}
export function closeDD() {
  dd.biz.navigation.close({
    onSuccess: function(result) {
      /* result结构
      {}
      */
    },
    onFail: function(err) {
      console.log(err)
    }
  })
}
