<!-- 
BgRenderWorker.vue - runs in an invisible window and does all the rendering.
It is called from VideoSettings.vue.
-->
<template>
  
</template>

<script>
  import {
    FileHandlerMixin
  } from './../mixins/FileHandlerMixin'

  import {
    VideoProcessingMixin
  } from './../mixins/VideoProcessingMixin'

  const ipcRenderer = require('electron').ipcRenderer;
  const BrowserWindow = require('electron').remote.BrowserWindow
  const remote = require('electron').remote;

  export default {
    name: 'bg-render-worker',
    data() {
      return {
        fpStore: [],
        vpStore: [],
        fromWindowId: 0
      }
    },
    mixins: [FileHandlerMixin, VideoProcessingMixin],
    mounted: async function() {

      ipcRenderer.on('process-vid-in-background', async(info, filePathStore, vidPropsStore, fromWindowID) => {
        this.duplicateStoreFromMainWindow(filePathStore, vidPropsStore)
        this.fpStore = filePathStore;
        this.vpStore = vidPropsStore;
        this.fromWindowId = fromWindowID;
        const fromWindow = BrowserWindow.fromId(fromWindowID)
        const windowID = remote.getCurrentWindow();
        await remote.getCurrentWindow().webContents.send('bgProcessStoreUpdate');
      })

      ipcRenderer.on('approveBgRender', () => {
        this.startBgRender();
      })
    },
    methods: {
      startBgRender: async function() {
        try {
          await this.extractAudioSrc(this.fpStore.filePath, this.fpStore.audioExtractedFolder);
          await this.convertVideoToFrames(this.fpStore.filePath, this.fpStore.rawPngFolder);
          await this.potraceSrcFramesPromise(this.fpStore.rawPngFolder, this.fpStore.rawSvgFolder);
          await this.convertSvgToPng(this.fpStore.rawSvgFolder, this.fpStore.convertedPngFolder, this.vpStore.outResolution);
          await this.renderPngFramesToVideo(this.fpStore.convertedPngFolder, this.fpStore.outputFilepath);
          remote.getCurrentWindow().close();
        } catch (err) {
          /* TODO: error handling */
          console.err(err);
        }
      },
      duplicateStoreFromMainWindow: function(fpStore, vpStore) {
        this.$store.commit('setCurrentFilepath', fpStore.filePath);
        this.$store.commit('setExtractedAudioFolder', fpStore.audioExtractedFolder);
        this.$store.commit('setOutputFilepath', fpStore.outputFilepath);
        this.$store.commit('setRawPngFolder', fpStore.rawPngFolder);
        this.$store.commit('setRawSvgFolder', fpStore.rawSvgFolder);
        this.$store.commit('setConvertedPngFolder', fpStore.convertedPngFolder);
        this.$store.commit('setScreenshotFolder', fpStore.screenshotFolder);

        this.$store.commit('setDetail', vpStore.detail);
        this.$store.commit('setFgColor', vpStore.fgColor);
        this.$store.commit('setBgColor', vpStore.bgColor);
        this.$store.commit('setOutResolution', vpStore.outResolution);
        this.$store.commit('setOutFormat', vpStore.outFormat);
      }
    }
  }

</script>

<style>


</style>
