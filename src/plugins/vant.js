// 按需全局引入 vant组件
import Vue from 'vue'
import { Button, Cell, Collapse, CollapseItem, Dialog, Field, Icon, List, Loading, NavBar, Overlay, Sticky, Tabbar, TabbarItem, Toast, Uploader } from 'vant'
Vue.use(Button)
Vue.use(Cell)
Vue.use(Collapse).use(CollapseItem)
Vue.use(Dialog)
Vue.use(Field)
Vue.use(Icon)
Vue.use(List)
Vue.use(Loading)
Vue.use(NavBar)
Vue.use(Overlay)
Vue.use(Sticky)
Vue.use(Tabbar).use(TabbarItem)
Vue.use(Toast)
Vue.use(Uploader)

Toast.setDefaultOptions({ duration: 3000 });
