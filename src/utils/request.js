import axios from 'axios'
import store from '@/store'
import { Toast } from 'vant'
// 根据环境不同引入不同api地址
import { baseApi } from '@/config'
// create an axios instance
const service = axios.create({
  baseURL: baseApi, // url = base api url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 20000 // request timeout
})

// request拦截器 request interceptor
service.interceptors.request.use(
  config => {
    if (config.url.indexOf('jsapi') !== -1) {
      config.baseURL = 'https://dingding.weichai.com'
    }
    config.headers['Authorization'] = store.getters.token
    // 测试环境
    // duyan
    // config.headers['Authorization'] = 'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MjgxNTc2MzgsInN1YiI6IntcImxvZ2lubmFtZVwiOlwiZHV5YW4wMVwifSJ9.J-8Ym5t8A0L-xPZxMdfTCGm9ai5M9JaSzkdU9jsZYh4'
    // 正式环境
    // duyan
    // config.headers['Authorization'] = 'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NTM5NTk5MTcsInN1YiI6IntcImxvZ2lubmFtZVwiOlwiZHV5YW4wMVwifSJ9.kxRLfnn5nv0rGRct8TMGXptXa5mYegmi6UA8w6QpGZs'
    // 不传递默认开启loading
    if (!config.hideloading) {
      // loading
      Toast.loading({
        message:'加载中...',
        forbidClick: true
      })
    }
    if (store.getters.token) {
      config.headers['X-Token'] = store.getters.token
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)
// respone拦截器
service.interceptors.response.use(
  response => {
    Toast.clear()
    const res = response.data
    if (res.status && res.status !== 200) {
      // 登录超时,重新登录
      if (res.status === 401) {
        store.dispatch('FedLogOut').then(() => {
          location.reload()
        })
      }
      return Promise.reject(res || 'error')
    } else {
      return Promise.resolve(res)
    }
  },
  error => {
    Toast.clear()
    console.log('err' + error) // for debug
    return Promise.reject(error)
  }
)

export default service
