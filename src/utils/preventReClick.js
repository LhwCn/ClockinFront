/*
 * @Description: 防止重复点击事件
 */
export default {
  install(Vue) {
    // 防重复点击(指令实现)
    Vue.directive('preventReClick', {
      inserted(el, binding) {
        el.addEventListener('click', () => {
          if (!el.disabled) {
            el.disabled = true
            setTimeout(() => {
              el.disabled = false
            }, binding.value || 30000)
          }
        })
      }
    })
  }
}
