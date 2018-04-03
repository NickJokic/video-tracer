<template>
    <div class="container">
        <h1 class="status">{{status}}</h1>
        <button v-if="tmpProgress == 100" @click="reloadInitialState" id="home-button">home</button>
        <div v-if="tmpProgress < 100" id="progress-container" style="height:75%;margin:auto;grid-row-start:3;" data-type="fill" data-fill="data:ldbar/res,gradient(0,1.5,#3fc93f,#f9bd2e,#f55f58,#3fc93f)" data-fill-background-extrude="2" data-fill-background="#000" data-path="M189 245H282V312H189V245ZM287 266H294V291H287V266ZM323 301 299 291V266L323 253 323 301ZM210 200C221 200 229 209 229 219S221 238 210 238 192 230 192 219 200 200 210 200ZM254 208C263 208 269 215 269 223S263 238 254 238 239 231 239 223 246 208 254 208Z">       
        </div>
    </div>
</template>


<script>
  import {
    FileHandlerMixin
  } from './../mixins/FileHandlerMixin'
  const ipcRenderer = require('electron').ipcRenderer;
  const remote = require('electron').remote;
  const {
    shell
  } = require('electron');

  export default {
    name: "video-renderer",
    mixins: [FileHandlerMixin],
    mounted: function() {
      let bar1 = new ldBar("#progress-container");
      this.progressBar = bar1;

      ipcRenderer.on('progress', (event, message) => {
        this.status = message;
      });

      ipcRenderer.on('audioProgress', (event, prog) => {
        this.tmpProgress = parseFloat(((0.20 * prog)).toFixed(2));
        this.progressBar.set(this.tmpProgress);
      });

      ipcRenderer.on('framesProgress', (event, prog) => {
        this.tmpProgress = parseFloat((20 + (0.20 * prog)).toFixed(2));
        this.progressBar.set(this.tmpProgress);
      });

      ipcRenderer.on('potraceProgress', (event, prog) => {
        this.tmpProgress = parseFloat((40 + (0.20 * prog)).toFixed(2));
        this.progressBar.set(this.tmpProgress);
      });

      ipcRenderer.on('svgToPngProgress', (event, prog) => {
        this.tmpProgress = parseFloat((60 + (0.20 * prog)).toFixed(2));
        this.progressBar.set(this.tmpProgress);
      });

      ipcRenderer.on('export-progress', (event, prog) => {
        this.tmpProgress = parseFloat((80 + (0.20 * prog)).toFixed(2));
        this.progressBar.set(this.tmpProgress);

        /* Show a notification and open the containing folder when export is finished */
        if (prog == 100) {
          this.tmpProgress = 100;
          this.status = "Export successful!"
          let renderSuccess = new Notification('VideoVectorizer', {
            body: 'Video successfully rendered!'
          });
          shell.showItemInFolder(this.$store.state.FileHandler.outputFilepath);
        }
      });
    },
    methods: {
      reloadInitialState: function() {
        /* Reset store */
        this.$store.commit('resetState');
        /* Clean tmp folders */
        remote.getCurrentWindow().webContents.send('resetAppTmpData', '1');
        /* Go to home screen */
        this.$router.push({
          path: '/'
        });

      }
    },
    data() {
      return {
        status: "",
        tmpProgress: 0,
        exportProgress: 0,
        progressBar: ""
      }
    }
  }

</script>

<style scoped>
  .container {
    width: 100%;
    height: 100%;
    background: rgba(29, 31, 33, 1);
    display: grid;
    grid-template-rows: 100px 100px 200px 100px;
    grid-template-columns: 1fr;
    justify-items: center;
    align-items: center;
  }
  
  .status {
    font-size: 5em;
    grid-row-start: 2;
  }
  
  #progress-container {
    width: 200px;
    height: 200px;
  }
  
  #home-button {
    width: 150px;
    height: 50px;
    grid-row-start: 3;
    border: none;
    background: #fff;
    font-family: inherit;
    font-size: 40px;
    -webkit-box-shadow: 6px 6px 10px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 6px 6px 10px 0px rgba(0, 0, 0, 0.75);
    box-shadow: 6px 6px 10px 0px rgba(0, 0, 0, 0.75);
    transition: 0.4s all;
  }
  
  #home-button:hover {
    background: #3fc93f;
    cursor: pointer;
  }

</style>

<style>
  .ldBar-label {
    font-size: 3em !important;
    position: relative;
    right: 20px;
  }

</style>
