import Vue from 'vue'

let initialState = {
  detail: 0,
  fgColor: "",
  bgColor: "",
  outResolution: "",
  outFormat: ""
}

const state = Vue.util.extend({}, initialState);

const mutations = {

  setDetail: function (state, detail) {
    state.detail = detail;
  },
  setFgColor: function (state, fgColor) {
    state.fgColor = fgColor;
  },
  setBgColor: function (state, bgColor) {
    state.bgColor = bgColor;
  },
  setOutResolution: function (state, outRes) {
    state.outResolution = outRes;
  },
  setOutFormat: function (state, outFormat) {
    state.outFormat = outFormat;
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
