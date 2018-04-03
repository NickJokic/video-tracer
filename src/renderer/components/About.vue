<template>
    <div class="container">
      <div class="content">
        <h1 class="youMakeMeGreen">{{appName}}</h1>
        <h2>created by <span class="youMakeMeGreen">{{author}}</span></h2>
        <p class="web-link" @click="openWebsite(website)">(nickjokic.com)</p>
        <p class="web-link youMakeMeGreen" @click="openWebsite(github)">GitHub (repo)</p>
        <p>{{date}}</p>

      </div>
  </div>
</template>

<script>
  const shell = require('electron').shell;


  export default {
    name: 'about',
    data() {
      return {
        appName: 'Video Tracer',
        author: 'Nick Jokic',
        github: 'https://github.com/NickJokic/video-tracer',
        website: 'http://www.nickjokic.com',
        date: 'April 2018'
      }
    },
    methods: {
      openWebsite: function(link) {
        shell.openExternal(link);
      }
    }
  }

</script>

<style scoped>
  .container {
    height: 450px;
    width: 450px;
    text-align: center;
    background: #232323;
    overflow: hidden;
    -webkit-user-select: none;
    -webkit-app-region: drag;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    grid-template-columns: 5% 90% 5%;
  }
  
  .content {
    grid-row-start: 2;
    grid-row-end: 2;
    grid-column-start: 2;
    grid-column-end: 2;
    font-size: 1.6em;
  }
  
  @keyframes fadeColor {
    0% {
      color: rgba(63, 201, 63, 0.7);
    }
    50% {
      color: rgba(63, 201, 63, 1);
    }
    100% {
      color: rgba(63, 201, 63, 0.7);
    }
  }
  
  .youMakeMeGreen {
    color: #3fc93f;
    animation: fadeColor 1.5s infinite ease-in;
  }
  
  .web-link {
    cursor: pointer;
  }

</style>
