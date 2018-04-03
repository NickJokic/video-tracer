import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'
import loadingBar from './assets/js/loading-bar.min.js'
import './assets/css/loading-bar.css'


if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.prototype.$toastr = toastr;

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  toastr,
  template: '<App/>'
}).$mount('#app')
