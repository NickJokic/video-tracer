<template>
  <div id="app">
    <div class="title-bar">
    </div>
    <transition name="fade">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'video-tracer'
  }

  /* prevent dragged file from causing a save dialog */
  document.addEventListener('dragover', function(event) {
    event.preventDefault();
    return false;
  }, false);

  document.addEventListener('drop', function(event) {
    event.preventDefault();
    return false;
  }, false);

</script>

<style>
  .title-bar {
    height: 34px;
    width: 100%;
    background: #22232a;
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }
  
  #app-title {
    position: relative;
    top: 8px;
    margin: 0;
    padding: 0;
    font-size: 28px;
  }
  /* CSS */
  
  @font-face {
    font-family: 'Dotty';
    src: url('assets/dotty.ttf');
  }
  
  body {
    font-family: 'Dotty', sans-serif;
    height: 600px;
    width: 750px;
    margin: 0 !important;
    padding: 0 !important;
    position: relative;
    color: #fff;
    font-weight: 300;
    text-align: center;
    background: #fff;
    overflow: hidden;
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }
  
  #app {
    height: 100%;
    width: 100%;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition-property: opacity;
    transition-duration: .25s;
  }
  
  .fade-enter-active {
    transition-delay: .25s;
  }
  
  .fade-enter,
  .fade-leave-active {
    opacity: 0
  }

</style>
