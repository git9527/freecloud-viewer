<template>
  <div class="content">
      <div class="title">
        <h2>{{ siteHeader }}</h2>
      </div>
      <div class="list-wrapper">
        <div class="list-container">
          <div class="header-container">
            <div class="navigation-bar">
              <h3>
                <span
                  v-for="(item, index) in pathStack"
                  :key="item"
                  @click="toPreviousFolder(index)">
                  <span v-if="item === '/' || item === ''">
                    <i class="iconfont icon-home"></i>
                    首页
                  </span>
                  <span v-else>{{ item }}</span>
                  <span class="path-separator" v-if="item || item !== '/'"
                    >>
                  </span>
                </span>
              </h3>
            </div>
          </div>

          <uni-table :loading="loading" :emptyText="error.message || '没有更多数据'" stripe >
              <uni-tr>
                  <uni-th min-width="150" align="left">文件名</uni-th>
                  <uni-th width="100" align="center">添加时间</uni-th>
              </uni-tr>
              <uni-tr v-for="(item,index) in files" :key="index">
                <uni-td align="left">
                  <view class="uni-flex uni-row">
                    <span v-if="item.isFolder" class="flex-item iconfont file-icon icon-folder"></span>
                    <span v-else :class="['iconfont','file-icon', getFileType(item.name)]"></span>
                    <view class="flex-item">
                      <a v-if="item.isFolder" class="folder-name" @click="enterFolder(item.name)">{{item.name}}</a>
                      <a v-else @click="fileClick(item, index)" class="file-name">{{item.name}}</a>
                    </view>
                  </view>
                </uni-td>
                <uni-td align="center">
                  <uni-dateformat :date="item.createOn" :threshold = "[0,0]" format="MM-dd hh:mm"/>
                </uni-td>
              </uni-tr>
            </uni-table>
        </div>
      </div>

      <uni-popup ref="imagePopup" class="popup-container">
          <img :src="previewLink" class="previewImage" :style="{'max-width': getFrameWidth(), 'max-height': getFrameHeight()}"/>
      </uni-popup>
      <uni-popup ref="officePopup" class="office-container">
        <iframe :src="'https://owa-box.vips100.com/op/embed.aspx?src=' + previewLink + '&wdPrint=0&wdEmbedCode=0'" :width="getFrameWidth()" :height="getFrameHeight()" frameborder="0"></iframe>
      </uni-popup>
      <uni-popup ref="videoPopup" class="video-container">
        <view>
           <video id="myVideo" :src="previewLink" controls autoplay show-mute-btn :style="{'width': getFrameWidth(), 'height': getFrameHeight()}" x5-playsinline="true" x5-video-player-type="h5-page"></video>
        </view>
      </uni-popup>
      <a-player v-if="showAudio" autoplay :music="music" float repeat="repeat-one" class="audio-container"></a-player>
  </div>
</template>

<script>
import { getFilesByParent } from '../../api/index.js'
import { formatSize, checkFileType } from '../../utils/index.js'
import APlayer from 'vue-aplayer'
import Vue from 'vue'
import uweb from 'vue-uweb'

export default {
  components: {
    APlayer
  },
  computed: {
    music () {
      return {
        src: this.audioLink,
        title: this.audioName,
        artist: ' '
      }
    }
  },
  data () {
    return {
      siteHeader: '',
      pathStack: [],
      files: [],
      loading: false,
      error: {},
      previewLink: '',
      audioLink: '',
      audioName: '',
      audioAction: {
        method: 'pause'
      },
      showAudio: false
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    $route: {
      handler () {
        this.init()
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    getFrameWidth () {
      const fullWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
      return fullWidth * 0.9 + 'px'
    },
    getFrameHeight () {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      return height * 0.8 + 'px'
    },
    getListHeight () {
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      return height - 200 + 'px'
    },
    formatSize (size) {
      return formatSize(size)
    },
    getFileType (name) {
      return 'icon-' + checkFileType(name)
    },
    getCurrentFolder () {
      let currentPath = this.$route.path
      if (currentPath[currentPath.length - 1] === '/') {
        currentPath = currentPath.slice(0, -1)
      }
      return currentPath
    },
    async init () {
      this.loading = true
      const currentPath = this.getCurrentFolder()
      const [err, resp] = await getFilesByParent(currentPath)
      const body = resp.data
      console.log('error', err, 'body', body)
      if (body.code === 0) {
        this.files = body.data.files
        this.pathStack = currentPath.split('/')
        const siteInfo = body.data.siteInfo
        document.title = siteInfo.htmlTitle
        this.siteHeader = siteInfo.siteHeader
        Vue.use(uweb, siteInfo.cnzzId)
      } else {
        uni.showToast({
          title: '111'
        })
      }
      this.loading = false
    },
    enterFolder (name) {
      const target = this.getCurrentFolder() + '/' + name
      this.$router.push({
        path: target
      })
    },
    toPreviousFolder (index) {
      if (index + 1 !== this.pathStack.length) {
        const stack = this.pathStack.slice(0, index + 1)
        const targetUrl = stack.length === 1 ? '/' : stack.join('/')
        console.log('target url', targetUrl)
        this.$router.push({
          path: targetUrl
        })
      } else {
        uni.showToast({
          title: '已在该目录'
        })
      }
    },
    fileClick (file, index) {
      const fileName = file.name
      const downloadUrl = file.link
      const fileType = checkFileType(fileName)
      if (fileType === 'video') {
        this.playVideo(downloadUrl, index)
      } else if (fileType === 'image') {
        this.showImage(downloadUrl, index)
      } else if (fileType === 'audio') {
        this.playAudio(file, index)
      } else if (['excel', 'pdf', 'powerpoint', 'word'].includes(fileType)) {
        this.showOffice(downloadUrl, index)
      } else {
        this.downloadFile(fileName, downloadUrl)
      }
    },
    showImage (downloadUrl) {
      this.previewLink = downloadUrl
      this.$refs.imagePopup.open()
    },
    showOffice (downloadUrl) {
      this.previewLink = downloadUrl
      this.$refs.officePopup.open()
    },
    playVideo (playUrl, index) {
      this.previewLink = playUrl
      this.showAudio = false
      this.$refs.videoPopup.open()
    },
    playAudio (file, index) {
      this.showAudio = false
      this.$nextTick(() => {
        this.audioLink = file.link
        this.audioName = file.name
        this.showAudio = true
      })
    }
  }
}
</script>

<style>
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .list-wrapper {
    margin-bottom: 40px;
    position: relative;
    -webkit-box-shadow: 0 0 32px 0 rgba(0,0,0,.1);
    box-shadow: 0 0 32px 0 rgba(0,0,0,.1);
    z-index: 9;
    margin: 0 auto;
  }

  .header-container {
    margin: 0;
    border: 0 none;
    text-align: left;
    font-weight: 400;
    color: #000;
    background-color: #f7f7f9;
  }

  h3 {
    font-size: 16px;
  }

  @media (max-width: 992px) {
    .list-wrapper,.readme,.title {
      width:100%
    }

    .title {
      padding: 22px 10px
    }

    .header-container {
       padding: 5px 10px;
    }
  }

  @media (min-width: 993px) {
    .list-wrapper,.readme,.title {
      width:80%
    }

    .title {
      padding: 25px 0
    }

    .header-container {
      padding: 10px 30px
    }
  }
  .navigation-bar {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    padding: 10px 0;
  }
  h3>span>span:first-child {
    cursor: pointer;
    color: #000;
  }
  h3>span>span:first-child:hover{
      text-decoration: underline;
  }
  .path-separator {
    padding: 0 5px;
        color: #999;
  }
  .file-icon {
    margin-right: 5px;
    height: 26px;
    line-height: 26px;
  }
  .file-name, .folder-name {
    padding-left: 2px;
    padding-right: 2px;
    height: 26px;
    line-height: 26px;
  }
  .folder-name {
    font-weight: 700
  }
  .audio-container {
    width: 96%;
    position: fixed;
    left: 0;
    top: 3px;
    z-index: 10;
  }
  .title h2 {
    padding-left: 10px;
    font-size: 24px;
  }
  .previewImage {
    margin: auto;
    display: block;
  }
</style>
