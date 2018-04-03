<!-- 
VideoSettings.vue - enables users to change video settings and output parameters.
After clicking the convert button: it calls the invisible worker "BgRenderWorker.vue"
and navigates to "VideoRenderer.vue" which shows the progress.
-->

<template>
    <div class="container">
        <div class="heading">
            <h1 class="text-no-margin">adjust settings</h1>
            <a @click="goBackToHome" class="previous">&#x25c0;</a>
        </div>
        <div class="preview-placeholder">
            <img id="preview-screenshot" v-bind:src="screenshotPath"/>
        </div>
        <div class="detail-control">
            <div style="height:25px;">
                <input v-model="detailSliderValue" v-on:change="updateScreenshotOnDetailChange" id="detail-slider" type="range" min="1" max="100" value="50" step="1">
            </div>
            <p>detail</p>
        </div>
        <div class="color-control">
            <div class="fg-control">
                <p>foreground</p>
                <input v-model="foregroundValue" v-on:change="updateScreenshotOnDetailChange" type="color" value="#000000">
            </div>
            <div class="fg-control">
                <p>background</p>
                <input v-model="backgroundValue" v-on:change="updateScreenshotOnDetailChange" type="color" value="#ffffff">
            </div>
        </div>
        <div class="button-holder">
            <button @click="startBackgroundRendering" id="convert-button" type="button">convert</button>
        </div>
        <div class="resolution-control">
            <select v-model="outputResolution" size=1>
                <option value="3840x2160">2160p (4k)</option>
                <option default value="1920x1080">1080p (FHD)</option>
                <option value="1280x720">720p (HD)</option>
                <option value="960x540">540p (qHD)</option>
                <option value="640x360">360p (nHD)</option>
            </select>
            <p>resolution</p>
        </div>
        <div class="format-control">
            <select v-model="outputFormat" size=1>
                <option value="mp4">mp4</option>
                <option value="avi">avi</option>
                <option default value="mov">mov</option>
            </select>
            <p>format</p>
        </div>
    </div>
</template>

<script>
  import {
    FileHandlerMixin
  } from './../mixins/FileHandlerMixin'

  import {
    VideoProcessingMixin
  } from './../mixins/VideoProcessingMixin'

  const {
    dialog
  } = require('electron').remote;

  const remote = require('electron').remote;
  const ipcRenderer = require('electron').ipcRenderer
  const BrowserWindow = require('electron').remote.BrowserWindow

  export default {
    name: 'video-settings',
    mixins: [FileHandlerMixin, VideoProcessingMixin],
    data() {
      return {
        screenshotPath: "",
        detailSliderValue: 50,
        foregroundValue: "#000000",
        backgroundValue: "#ffffff",
        outputResolution: "1920x1080",
        outputFormat: "mp4",
        isDialogOpened: false,
        isColorChanging: false
      }
    },
    mounted: async function() {
      try {
        await this.storeUpdatedProperties();
        await this.checkOrientation();
        await this.updatePreview();
      } catch (err) {
        this.$toastr.warning(err);
      }
    },
    watch: {
      outputResolution: function() {
        this.storeUpdatedProperties();
      },
      outputFormat: function() {
        this.storeUpdatedProperties();
      }
    },
    methods: {
      /* Update UI values in the Vuex store */
      storeUpdatedProperties: function() {
        this.$store.commit('setDetail', this.detailSliderValue);
        this.$store.commit('setFgColor', this.foregroundValue);
        this.$store.commit('setBgColor', this.backgroundValue);
        this.$store.commit('setOutResolution', this.outputResolution);
        this.$store.commit('setOutFormat', this.outputFormat);
      },
      updatePreview: async function() {
        let imgBase64 = await this.generatePreview();
        this.screenshotPath = imgBase64;
      },
      /* 
      Function that creates an invisible window, 
      which does all the heavy lifting, so that the UI isn't blocked 
      */
      createBackgroundWindowRenderer() {
        const windowID = remote.getCurrentWindow().id;
        const modalPath = process.env.NODE_ENV === 'development' ?
          `http://localhost:9080/#/bg-render-worker` :
          `file://${__dirname}/index.html#bg-render-worker`

        let backgroundWin = new BrowserWindow({
          width: 400,
          height: 320,
          webPreferences: {
            webSecurity: true
          },
          show: false
        })

        backgroundWin.on('close', function() {
          backgroundWin = null
        })

        backgroundWin.loadURL(modalPath)

        backgroundWin.webContents.on('did-finish-load', () => {
          backgroundWin.webContents.send('process-vid-in-background', this.$store.state.FileHandler, this.$store.state.VideoProperties, windowID)
        })
      },
      startBackgroundRendering: async function() {
        try {
          await this.saveFileDialog();
          this.createBackgroundWindowRenderer();
        } catch (err) {
          console.err(err);
        }
      },
      saveFileDialog: function() {
        return new Promise((resolve, reject) => {
          if (!this.isDialogOpened) {
            this.isDialogOpened = true;

            dialog.showSaveDialog({
              title: "Video export",
              message: "Save video to",
              filters: [{
                name: 'Movies',
                extensions: [this.$store.state.VideoProperties.outFormat]
              }]
            }, (filenames, err) => {
              this.isDialogOpened = false;
              if (filenames === undefined) {
                reject("Save dialog canceled");
                return;
              } else {
                this.$store.commit('setOutputFilepath', filenames);
                resolve();
                /* switch to processing component */
                this.$router.push({
                  path: '/video-renderer'
                });
              }
            });
          }
        });
      },
      updateScreenshotOnDetailChange: async function() {
        if (!this.isColorChanging) {
          this.storeUpdatedProperties();
          this.isColorChanging = true;
          await this.updatePreview();
          this.isColorChanging = false;
        }
      },
      goBackToHome: function() {
        /* Reset store */
        this.$store.commit('resetState');
        /* Clean tmp folders */
        remote.getCurrentWindow().webContents.send('resetAppTmpData', '1');
        /* Go to home screen */
        this.$router.push({
          path: '/'
        });
      }
    }
  }

</script>

<style scoped>
  /* RANGE SLIDER STYLE */
  
  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
  }
  
  input[type=range]:focus {
    outline: none;
  }
  
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 6px;
    cursor: pointer;
    box-shadow: 0px 0px 0.5px #000000, 0px 0px 0px #0d0d0d;
    background: #000000;
    border-radius: 0px;
    border: 0px solid #010101;
  }
  
  input[type=range]::-webkit-slider-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 2.9px solid #000000;
    height: 10px;
    width: 10px;
    border-radius: 0px;
    background: #ffffff;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -2px;
  }
  
  input[type=range]:focus::-webkit-slider-runnable-track {
    background: #000000;
  }
  
  input[type=range]::-moz-range-track {
    width: 100%;
    height: 6px;
    cursor: pointer;
    box-shadow: 0px 0px 0.5px #000000, 0px 0px 0px #0d0d0d;
    background: #000000;
    border-radius: 0px;
    border: 0px solid #010101;
  }
  
  input[type=range]::-moz-range-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 2.9px solid #000000;
    height: 10px;
    width: 10px;
    border-radius: 0px;
    background: #ffffff;
    cursor: pointer;
  }
  
  input[type=range]::-ms-track {
    width: 100%;
    height: 6px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  
  input[type=range]::-ms-fill-lower {
    background: #000000;
    border: 0px solid #010101;
    border-radius: 0px;
    box-shadow: 0px 0px 0.5px #000000, 0px 0px 0px #0d0d0d;
  }
  
  input[type=range]::-ms-fill-upper {
    background: #000000;
    border: 0px solid #010101;
    border-radius: 0px;
    box-shadow: 0px 0px 0.5px #000000, 0px 0px 0px #0d0d0d;
  }
  
  input[type=range]::-ms-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 2.9px solid #000000;
    height: 10px;
    width: 10px;
    border-radius: 0px;
    background: #ffffff;
    cursor: pointer;
    height: 6px;
  }
  
  input[type=range]:focus::-ms-fill-lower {
    background: #000000;
  }
  
  input[type=range]:focus::-ms-fill-upper {
    background: #000000;
  }
  
  .container {
    width: 100%;
    height: 100%;
    background: rgba(29, 31, 33, 1);
    display: grid;
    grid-template-rows: 60px 210px 75px 75px 1fr;
    grid-template-columns: 25% 25% 25% 25%;
    justify-items: center;
    align-items: center;
    grid-row-gap: 1rem;
  }
  
  .preview-placeholder {
    grid-row-start: 2;
    grid-row-end: 2;
    grid-column-start: 2;
    grid-column-end: 4;
    border: solid 1px;
    background: rgba(255, 255, 255, 0.1);
    width: 100%;
    height: 100%;
  }
  
  #preview-screenshot {
    width: 100%;
    height: 100%;
  }
  
  .heading {
    grid-row-start: 1;
    grid-row-end: 1;
    grid-column-start: 2;
    grid-column-end: 4;
    color: #fff;
  }
  
  .previous {
    color: #ffffff;
    background: none;
    border: none;
    font-size: 1.2em;
    position: absolute;
    top: 50px;
    left: 20px;
    text-decoration: none;
    transition: 0.4s all;
  }
  
  .previous:hover {
    cursor: pointer;
    color: #f9bd2e;
  }
  
  .detail-control {
    grid-row-start: 3;
    grid-row-end: 3;
    grid-column-start: 2;
    grid-column-end: 3;
    width: 100%;
    height: 100%;
    -webkit-app-region: no-drag;
  }
  
  #detail-slider {
    width: 150px;
    padding: 0;
    margin: auto;
    margin-top: 6px;
  }
  
  .color-control {
    grid-row-start: 3;
    grid-row-end: 3;
    grid-column-start: 3;
    grid-column-end: 4;
    text-align: center;
    width: 100%;
    height: 75px;
  }
  
  .fg-control {
    height: 25px;
  }
  
  .fg-control>p {
    display: inline-block;
    vertical-align: middle;
  }
  
  input[type="color"] {
    -webkit-appearance: none;
    border: solid 1px #eee;
    width: 20px;
    height: 20px;
    margin: 0;
    padding: 0;
    float: right;
    position: relative;
    -webkit-box-shadow: 6px 6px 10px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 6px 6px 10px 0px rgba(0, 0, 0, 0.75);
    box-shadow: 6px 6px 10px 0px rgba(0, 0, 0, 0.75);
    right: 20px;
    -webkit-app-region: no-drag;
  }
  
  input[type="color"]:hover {
    cursor: pointer;
  }
  
  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  input[type="color"]::-webkit-color-swatch {
    border: none;
  }
  
  #convert-button {
    width: 150px;
    height: 50px;
    border: none;
    background: #fff;
    font-family: inherit;
    font-size: 40px;
    -webkit-box-shadow: 6px 6px 10px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 6px 6px 10px 0px rgba(0, 0, 0, 0.75);
    box-shadow: 6px 6px 10px 0px rgba(0, 0, 0, 0.75);
    transition: 0.4s all;
  }
  
  #convert-button:hover {
    background: #3fc93f;
    cursor: pointer;
  }
  
  .button-holder {
    grid-row-start: 5;
    grid-row-end: 5;
    grid-column-start: 2;
    grid-column-end: 4;
    width: 100%;
    height: 100%;
    -webkit-app-region: no-drag;
  }
  
  .resolution-control {
    grid-row-start: 4;
    grid-row-end: 4;
    grid-column-start: 2;
    grid-column-end: 3;
    width: 100%;
    height: 100%;
    -webkit-app-region: no-drag;
  }
  
  .format-control {
    grid-row-start: 4;
    grid-row-end: 4;
    grid-column-start: 3;
    grid-column-end: 4;
    width: 100%;
    height: 100%;
    -webkit-app-region: no-drag;
  }
  
  select {
    width: 150px;
    color: #fff;
    background: #000;
    border: none;
    border: none;
    height: 30px;
    font-size: 14px;
  }
  
  select,
  option {
    text-align-last: center;
  }
  
  h1,
  h2,
  p {
    margin: 0;
  }
  
  p {
    font-size: 35px;
  }

</style>
