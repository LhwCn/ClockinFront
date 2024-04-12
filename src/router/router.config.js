/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/',
    component: () => import('@/views/layouts/index'),
    redirect: '/login',
    meta: {
      title: '首页',
      keepAlive: false
    },
    children: [
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/modules/login'),
        meta: { title: '登录', keepAlive: false }
      },
      {
        path: '/dd-sso',
        name: 'DdSso',
        component: () => import('@/views/modules/dd-sso'),
        meta: { title: '登录中', keepAlive: false }
      },
      {
        path: '/inside',
        name: 'Inside',
        component: () => import('@/views/modules/inside'),
        meta: { title: '沃考勤', keepAlive: false }
      },
      {
        path: '/carNo',
        name: 'CarNo',
        component: () => import('@/views/modules/carNo'),
        meta: { title: '沃考勤', keepAlive: false }
      },
      {
        path: '/count',
        name: 'Count',
        component: () => import('@/views/modules/count'),
        meta: { title: '统计', keepAlive: false }
      },
      {
        path: '/lastRecord',
        name: 'LastRecord',
        component: () => import('@/views/modules/last-record'),
        meta: { title: '上月记录', keepAlive: false }
      }
    ]
  }
]
