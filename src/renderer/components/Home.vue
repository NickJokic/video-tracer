<template>
    <div class="container">
        <div class="drop-here" @drop="onDrop" @click="openFileDialog">
            <p>drop video</p>
        </div>
    </div>
</template>

<script>
  const {
    dialog
  } = require('electron').remote;

  import {
    FileHandlerMixin
  } from './../mixins/FileHandlerMixin'


  export default {
    name: 'home',
    mixins: [FileHandlerMixin],
    data() {
      return {
        isDialogOpened: false,
        allowedFileExtensions: []
      }
    },
    mounted: async function() {
      this.allowedFileExtensions = this.$store.state.FileHandler.allowedFileExtensions;
      await this.createTempDirsPromise();
    },
    methods: {
      onDrop: function(ev) {
        let selectedFilePath = ev.dataTransfer.items[0].getAsFile().path.toLowerCase();
        let selectedFileExtension = selectedFilePath.substring(selectedFilePath.length - 3, selectedFilePath.length);

        if (this.allowedFileExtensions.indexOf(selectedFileExtension) < 0) {
          this.$toastr.warning("File is not a movie!");
        } else {
          this.$store.commit('setCurrentFilepath', selectedFilePath);
          /* switch to processing component */
          this.$router.push({
            path: '/video-settings'
          });
        }
      },
      openFileDialog: async function() {
        /* check if another dialog is already open */
        if (!this.isDialogOpened) {
          this.isDialogOpened = true;

          dialog.showOpenDialog({
            title: "Select a video",
            message: "Select a video",
            properties: [
              'openFile'
            ],
            filters: [{
              name: 'Movies',
              extensions: this.allowedFileExtensions
            }]
          }, async filenames => {
            this.isDialogOpened = false;

            if (filenames === undefined) {
              return;
            }
            this.$store.commit('setCurrentFilepath', filenames[0]);

            /* switch to processing component */
            this.$router.push({
              path: '/video-settings'
            });
          });
        }
      }
    }
  }

</script>

<style scoped>
  @keyframes borderAnim {
    0% {
      color: #333333;
    }
    50% {
      color: #3fc93f;
    }
    100% {
      color: #333333;
    }
  }
  
  .container {
    width: 100%;
    height: 100%;
    /*background: #2c3e50;*/
    background: rgba(29, 31, 33, 1);
    display: grid;
    grid-template-rows: 150px 300px 150px;
    grid-template-columns: 187.5px 375px 187.5px;
    justify-items: center;
  }
  
  .drop-here {
    color: #333333;
    height: 300px;
    width: 375px;
    grid-row-start: 2;
    grid-column-start: 2;
    border: dashed 3px;
    display: grid;
    grid-template-rows: 100px 100px 100px;
    grid-template-columns: 375px;
    animation: borderAnim ease-in-out;
    animation-iteration-count: infinite;
    animation-duration: 1.5s;
    -webkit-app-region: no-drag;
    cursor: pointer;
  }
  
  .drop-here> p {
    color: #3fc93f;
    position: relative;
    text-align: center;
    margin: 0;
    font-size: 50px;
    align-self: center;
    grid-row-start: 2;
    grid-column-start: 1;
    animation: borderAnim ease-in-out;
    animation-iteration-count: infinite;
    animation-duration: 1.5s;
  }

</style>
