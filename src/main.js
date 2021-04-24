import Vue from 'vue'
import App from './App'
import ZAudio from '@/components/uniapp-zaudio'

Vue.config.productionTip = false
const zaudio = new ZAudio({
  continuePlay: true, // 续播
  autoPlay: true // 自动播放 部分浏览器不支持
})

Vue.prototype.$zaudio = zaudio
App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()
