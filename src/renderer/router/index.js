import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/components/Home').default
    }, {
      path: '/video-settings',
      name: 'video-settings',
      component: require('@/components/VideoSettings').default
    },
    {
      path: '*',
      redirect: '/'
        },
    {
      path: '/video-renderer',
      name: 'video-renderer',
      component: require('@/components/VideoRenderer').default
        },
    {
      path: '/bg-render-worker',
      name: 'bg-render-worker',
      component: require('@/components/BgRenderWorker').default
        },
    {
      path: '/about',
      name: 'about',
      component: require('@/components/About').default
    }
  ]
})
