<template>
  <div>
      <router-view></router-view>
  </div>
</template>
<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style>
  @import '@/static/uni.css';
  @import '@/static/iconfont/iconfont.css';
</style>
