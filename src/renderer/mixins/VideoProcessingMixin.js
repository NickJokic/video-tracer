/* 
VideoProcessingMixin.js:
Implements all of the image/video algorithmic processing.
This mixin is accessible to all components.
*/

import ffmpeg from 'fluent-ffmpeg'
import config from '../../../config.js'
import potrace from 'potrace'
import fs from 'fs'
import svg2img from 'svg2img'
import imageInfo from 'image-info'
import Promise from 'bluebird'
import base64Img from 'base64-img'

const ipcRenderer = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;
const remote = require('electron').remote;

export const VideoProcessingMixin = {
  data() {
    return {
      srcFilepath: "",
      extractedAudioPath: "",
      screenshotFolder: "",
      params: {
        background: "",
        color: "",
        threshold: 50
      },
      outputResolution: "",
      outputFormat: "",
      mainWindow: "",
      outputFilepath: "",
      outputFrameRate: 0,
      isPortraitMode: false,
      inputResolution: "",
      inputNumOfStreams: 0
    }
  },
  mounted() {

    this.setFfmpegBinariesPath();

    ipcRenderer.on('bgProcessStoreUpdate', (info) => {
      this.retrieveStoredProperties();

      /* Send approval to background worker to start rendering */
      this.mainWindow = BrowserWindow.getAllWindows()[1];
      remote.getCurrentWindow().webContents.send('approveBgRender')
    });

    this.mainWindow = BrowserWindow.getAllWindows()[1];
  },

  methods: {
    setFfmpegBinariesPath: function () {
      ffmpeg.setFfmpegPath(config.ffmpegPath);
      ffmpeg.setFfprobePath(config.ffprobePath);
    },
    retrieveStoredProperties: function () {
      this.srcFilepath = this.$store.state.FileHandler.filePath;
      this.extractedAudioPath = this.$store.state.FileHandler.audioExtractedFolder;
      this.screenshotFolder = this.$store.state.FileHandler.screenshotFolder;
      this.params.background = this.$store.state.VideoProperties.bgColor;
      this.params.color = this.$store.state.VideoProperties.fgColor;
      this.params.threshold = this.$store.state.VideoProperties.detail * 2.5;
      this.outputResolution = this.$store.state.VideoProperties.outResolution;
      this.outputFilepath = this.$store.state.FileHandler.outputFilepath;
      this.outputFormat = this.$store.state.VideoProperties.outFormat;
    },
    generatePreview: async function () {
      try {
        this.retrieveStoredProperties();
        await this.generateSingleScreenshot();
        await this.potraceImage(this.screenshotFolder + "/screenshotRaw.png", this.screenshotFolder, "screenshotPotraced.svg");
        return base64Img.base64Sync(this.screenshotFolder + "/screenshotPotraced.svg");
      } catch (err) {
        this.$toastr.warning(err);
      }
    },
    checkOrientation: async function () {
      this.retrieveStoredProperties();

      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(this.srcFilepath, (err, metadata) => {
          if (err) {
            reject(err);
            return;
          }

          this.inputNumOfStreams = metadata["streams"].length;

          /* Read input video's framerate */
          this.outputFrameRate = metadata["streams"][0]["height"] == undefined ? parseFloat(eval(metadata["streams"][1]["avg_frame_rate"])) : parseFloat(eval(metadata["streams"][0]["avg_frame_rate"]));

          /* Read input video's resolution and check if portrait mode is used */
          for (let i = 0; i < this.inputNumOfStreams; i++) {
            /* Check portrait mode and aspect ratio */
            if (metadata["streams"][i]["rotation"] !== undefined || (metadata["streams"][i]["height"] > metadata["streams"][i]["width"])) {
              this.inputResolution = metadata["streams"][i]["width"] + "x" + metadata["streams"][i]["height"];
              this.isPortraitMode = true;
              resolve();
              break;
            } else if (metadata["streams"][i]["height"] !== undefined) {
              this.inputResolution = metadata["streams"][i]["width"] + "x" + metadata["streams"][i]["height"];
              this.isPortraitMode = false;
            }
          }
          resolve();
        });
      });
    },
    generateSingleScreenshot: function () {
      let command = ffmpeg();
      let containerSize = "377x212";
      let outWidth = 0;
      let outHeight = 0;

      ({
        outWidth,
        outHeight
      } = this.calcOutputResolution(this.inputResolution, containerSize));

      containerSize = outWidth + "x" + outHeight;

      return new Promise((resolve, reject) => {
        command.on('end', () => {
          resolve();
        }).on('error', (err) => {
          reject(err);
        }).input(this.srcFilepath).screenshots({
          folder: this.screenshotFolder,
          count: 1,
          timemarks: ['50%'],
          size: containerSize,
          filename: "screenshotRaw.png"
        });
      })
    },
    extractAudioSrc: function (inputPath, outputPath) {
      let command = ffmpeg();
      this.ipcProgressUpdate('progress', "Extracting audio");

      return new Promise((resolve, reject) => {

        if (this.inputNumOfStreams > 1) {
          command.on('end', () => {
            this.ipcProgressUpdate('audioProgress', 100);
            resolve();
          }).on('progress', (progress) => {
            this.ipcProgressUpdate('audioProgress', progress.percent.toFixed(2));
          }).on('error', (err) => {
            reject(err);
          }).input(inputPath).noVideo().audioCodec('libmp3lame').audioBitrate(320).output(outputPath + "/audioSrc.mp3").fps(this.outputFrameRate).run();
        } else {
          this.ipcProgressUpdate('audioProgress', 100);
          resolve();
        }

      });
    },
    potraceImage: function (inputPath, outputPath, outputName) {
      return new Promise((resolve, reject) => {

        potrace.trace(inputPath, this.params, (err, svg) => {
          if (err) {
            return reject(err);
          }

          let stream = fs.createWriteStream(outputPath + '/' + outputName);
          stream.write(svg);
          stream.on('error', (err) => {
            reject(err);
          })
          stream.on('finish', () => {
            resolve();
          })
          stream.end();
        })
      });
    },
    convertVideoToFrames: function (inputPath, outputPath) {
      let command = ffmpeg();
      this.ipcProgressUpdate('progress', "Extracting frames");

      return new Promise((resolve, reject) => {
        command.on('end', () => {
          this.ipcProgressUpdate('framesProgress', 100);
          resolve();
        }).on('progress', (progress) => {
          this.ipcProgressUpdate('framesProgress', progress.percent.toFixed(2));
        }).on('error', (err) => {
          reject(err);
        }).input(inputPath).withInputFps(this.outputFrameRate).output(outputPath + "/frame%05d.png").withOutputFps(this.outputFrameRate).size("380x?").run();

      })
    },
    potraceSrcFramesPromise: async function (rawPngDir, outputDir) {
      let progressCounter = 0;
      let progressPercentage = 0;
      let tmpOutputName = "";
      let filenames = await this.listFilesWithExtension(rawPngDir, ".png");

      /* Send progress update to the UI */
      this.ipcProgressUpdate('progress', "Tracing video");

      await Promise.map(filenames, async (tmpFrame, index) => {
        tmpOutputName = 'out' + (('00000' + (index + 1)).slice(-5)) + ".svg";
        await this.potraceImage(rawPngDir + "/" + tmpFrame, outputDir, tmpOutputName);
        progressCounter++;
        if (progressCounter % 30 == 0 || progressCounter == filenames.length) {
          progressPercentage = ((progressCounter / filenames.length) * 100).toFixed(2);
          this.ipcProgressUpdate('potraceProgress', progressPercentage);
        }
      }, {
        concurrency: 30
      });
    },
    convertSvgToPng: async function (svgDir, outputDir, outputResolution) {
      let tmpWidth = 0;
      let tmpHeight = 0;
      let outWidth = 0;
      let outHeight = 0;
      let progressCounter = 0;
      let progressPercentage = 0;

      ({
        outWidth,
        outHeight
      } = this.calcOutputResolution(this.inputResolution, outputResolution));

      let filenames = await this.listFilesWithExtension(svgDir, ".svg");

      /* Send progress update to the UI */
      this.ipcProgressUpdate('progress', "Converting frames");
      let tmpOutputName = "";

      await Promise.map(filenames, async (tmpFrame, index) => {
        tmpOutputName = 'out' + (('00000' + (index + 1)).slice(-5)) + ".png";
        await this.svgToPngImage(svgDir + "/" + tmpFrame, outWidth, outHeight, outputDir, tmpOutputName);

        /* Send progress update to the UI after 30th converted frame */
        progressCounter++;
        if (progressCounter % 30 == 0 || progressCounter == filenames.length) {
          progressPercentage = ((progressCounter / filenames.length) * 100).toFixed(2);
          this.ipcProgressUpdate('svgToPngProgress', progressPercentage);
        }
      }, {
        concurrency: 30
      });
    },
    svgToPngImage: function (inputFile, width, height, outputPath, outputName) {
      return new Promise((resolve, reject) => {
        svg2img(inputFile, {
          'width': width,
          'height': height
        }, (err, buffer) => {
          if (err) {
            return reject(err);
          } else {
            let stream = fs.createWriteStream(outputPath + '/' + outputName);
            stream.write(buffer);
            stream.on('error', (err) => {
              return reject(err);
            })
            stream.on('finish', () => {
              resolve();
            })
            stream.end();
          }
        })
      })
    },
    renderPngFramesToVideo: function (inputPngDir, outputFilePath) {

      return new Promise((resolve, reject) => {
        /* Send progress update to the UI */
        this.ipcProgressUpdate('progress', "Exporting video");
        let command = ffmpeg();

        /* Check if input video had audio stream */
        if (this.inputNumOfStreams > 1) {
          command.on('progress', (progress) => {
            this.ipcProgressUpdate('export-progress', progress.percent.toFixed(2));
          }).on('end', () => {
            this.ipcProgressUpdate('export-progress', 100);
            resolve();
          }).on('error', (err) => {
            reject("Error while rendering!\n" + err.toString());
          }).addInput(inputPngDir + "/out%05d.png").withInputFps(this.outputFrameRate).addInput(this.extractedAudioPath + "/audioSrc.mp3").output(outputFilePath).withOutputFps(this.outputFrameRate).videoCodec('libx264').outputOptions(['-pix_fmt yuv420p']).videoBitrate('10000k').format(this.outputFormat).run();
        } else {
          command.on('progress', (progress) => {
            this.ipcProgressUpdate('export-progress', progress.percent.toFixed(2));
          }).on('end', () => {
            this.ipcProgressUpdate('export-progress', 100);
            resolve();
          }).on('error', (err) => {
            reject("Error while rendering!\n" + err.toString());
          }).addInput(inputPngDir + "/out%05d.png").withInputFps(this.outputFrameRate).output(outputFilePath).withOutputFps(this.outputFrameRate).videoCodec('libx264').outputOptions(['-pix_fmt yuv420p']).videoBitrate('10000k').format(this.outputFormat).run();
        }
      })
    },
    /* 
    Function that calculates the final video 
    output resolution with preserved aspect ratio 
    */
    calcOutputResolution: function (inputResol, requestedOutputResol) {
      let inputSizeArr = inputResol.split('x');
      let inputWidth = parseInt(inputSizeArr[0]);
      let inputHeight = parseInt(inputSizeArr[1]);
      let reqOutputWidth = 0;
      let scaleFactor = 0;
      let outputResolution = {};

      if (this.isPortraitMode) {
        reqOutputWidth = parseInt(requestedOutputResol.split("x")[0]);
        scaleFactor = reqOutputWidth / inputHeight;
        outputResolution = {
          outWidth: Math.ceil(inputWidth * scaleFactor),
          outHeight: reqOutputWidth
        };

      } else {
        reqOutputWidth = parseInt(requestedOutputResol.split("x")[0]);
        scaleFactor = reqOutputWidth / inputWidth;
        outputResolution = {
          outWidth: reqOutputWidth,
          outHeight: Math.ceil(inputHeight * scaleFactor)
        };
      }

      /* Output dimensions must be divisible by 2 (or ffmpeg will throw error) */
      if (outputResolution.outHeight % 2 == 1) {
        outputResolution.outHeight += 1;
      } else if (outputResolution.outWidth % 2 == 1) {
        outputResolution.outWidth += 1;
      }

      return outputResolution;
    },
    checkFileExtension: function (file, extension) {
      return (file.substring(file.length - 4, file.length) == extension) ? true : false;
    },
    listFilesWithExtension: function (inputDir, extension) {
      return new Promise((resolve, reject) => {
        fs.readdir(inputDir, (err, filenames) => {
          if (err) {
            reject(err);
            return;
          }

          let tmpFrames = filenames.filter((el) => {
            return this.checkFileExtension(el, extension);
          });
          resolve(tmpFrames);
        });
      });
    },
    ipcProgressUpdate: function (ipcChannel, message) {
      this.mainWindow.webContents.send(ipcChannel, message);
    }
  }
}
