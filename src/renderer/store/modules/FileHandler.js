import Vue from 'vue'

let initialState = {
  filePath: "",
  audioExtractedFolder: "",
  outputFilepath: "",
  rawPngFolder: "",
  rawSvgFolder: "",
  convertedPngFolder: "",
  screenshotFolder: "",
  allowedFileExtensions: ['avi', 'mp4', 'mov']
}

const state = Vue.util.extend({}, initialState)

const mutations = {
  setCurrentFilepath(state, path) {
    state.filePath = path;
  },
  setOutputFilepath(state, path) {
    state.outputFilepath = path;
  },
  setRawPngFolder(state, path) {
    state.rawPngFolder = path;
  },
  setRawSvgFolder(state, path) {
    state.rawSvgFolder = path;
  },
  setConvertedPngFolder(state, path) {
    state.convertedPngFolder = path;
  },
  setScreenshotFolder(state, path) {
    state.screenshotFolder = path;
  },
  setExtractedAudioFolder(state, path) {
    state.audioExtractedFolder = path;
  },
  resetState(state) {
    for (let i in state) {
      Vue.set(state, i, initialState[i]);
    }
  }
}


const actions = {
  someAsyncTask({
    commit
  }) {
    // do something async

  }
}


export default {
  state,
  mutations,
  actions
}
