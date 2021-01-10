import Vue from 'vue'
import Router from 'uni-simple-router'

Vue.use(Router)

const router = new Router({
  h5: {
    vueRouterDev: true // 完全使用vue-router开发 默认 false
  },
  routes: [
    {
      path: '/preview/:type',
      component: () => import('@/pages/index/preview.vue')
    },
    {
      path: '*',
      name: 'index',
      aliasPath: '/', // 对于h5端你必须在首页加上aliasPath并设置为/
      component: () => import('@/pages/index/index.vue')
    }
  ]
})

export default router
