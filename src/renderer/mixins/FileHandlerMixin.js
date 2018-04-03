/* 
FileHandlerMixin.js:
Used for reading/writing/modifying files/folders on the filesystem.
This mixin is accessible to all components.
*/

import os from 'os';
import fs from 'fs';
var ipcRenderer = require('electron').ipcRenderer;

export const FileHandlerMixin = {
  mounted() {
    ipcRenderer.on('resetAppTmpData', (event, message) => {
      this.removeTempDirs();
    })

    /* Delete temporary folders before app quits */
    ipcRenderer.on('clearTempFiles', (event, message) => {
      ipcRenderer.send('cleaningStatus', 'cleaning');
      this.removeTempDirs();
      ipcRenderer.send('cleaningStatus', 'doneCleaning');
    });
  },
  data() {
    return {
      tempFolders: [],
      baseFolderName: "/video-tracer-",
      tmpBaseFolder: "",
      folderGenNames: ["/pngRaw-", "/svgRaw-", "/pngConv-", "/screenshotPreview-", "/audioRaw-"],
      storeFolderMutations: ['setRawPngFolder', 'setRawSvgFolder', 'setConvertedPngFolder', 'setScreenshotFolder', 'setExtractedAudioFolder']
    }
  },
  methods: {
    createBaseTmpFolder: function () {
      return new Promise((resolve, reject) => {
        fs.mkdtemp((fs.realpathSync(os.tmpdir()) + this.baseFolderName), (err, folder) => {
          if (err)
            return reject(err);

          this.tempFolders.push(folder);
          this.tmpBaseFolder = folder;
          resolve();
        });
      });
    },
    createTempDirsPromise: async function () {
      await this.createBaseTmpFolder();

      let promises = this.folderGenNames.map((file, i) => {
        return new Promise((resolve, reject) => {
          fs.mkdtemp((fs.realpathSync(this.tmpBaseFolder) + file), (err, folder) => {
            if (err)
              return reject(err)

            this.tempFolders.push(this.tmpBaseFolder + folder);
            this.$store.commit(this.storeFolderMutations[i], folder);
            resolve();
          });

        });
      });
      return Promise.all(promises);
    },

    removeTempDirs: function () {
      if (this.tempFolders.length > 0) {
        for (let i = 0; i < this.tempFolders.length; i++) {
          deleteFolderRec(this.tempFolders[i], i);
        }
        this.tempFolders = [];
      }

      function deleteFolderRec(path, index) {
        if (fs.existsSync(path)) {
          fs.readdirSync(path).forEach(function (file, index) {
            let curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
              deleteFolderRec(curPath);
            } else {
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(path);
        }
      };
    }
  }
}
