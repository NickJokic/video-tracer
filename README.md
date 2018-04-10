# Video Tracer

Video Tracer - electron-vue desktop app, which traces input videos and creates vector-styled videos using the Potrace algorithm.

![Screenshot 1](https://raw.githubusercontent.com/NickJokic/video-tracer/master/static/github-vt2.jpg)

![Screenshot 2](https://raw.githubusercontent.com/NickJokic/video-tracer/master/static/github-vt1.jpg)


## Features
+ converts regular video into a vector-styled video
+ users can adjust: colors, threshold (detail), output format & resolution

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development purposes.

### Prerequisites

Before you run the app in development, be sure you have these downloaded/installed on your machine:

+ npm
+ Node.js
+ Cairo & Pango ([node-canvas](https://github.com/Automattic/node-canvas) dependencies):


### Cairo & Pango installation
#### **Mac Os X:**

Homebrew:
```
brew install pkg-config cairo pango libpng jpeg giflib
```

MacPorts:
```
port install pkgconfig cairo pango libpng jpeg giflib
```

#### **Linux:**
Ubuntu:
```
sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
```

Fedora:
```
sudo yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel giflib-devel
```

Solaris:
```pkgin install cairo pango pkg-config xproto renderproto kbproto xextproto```

#### **Windows**:
[Instructions on wiki](https://github.com/Automattic/node-canvas/wiki/Installation---Windows)

### Installing (build setup)

``` bash
# install dependencies
npm install

# serve with hot reload
npm run dev

# build electron application for production
npm run build

```


## Built With

* [Electron](https://github.com/electron/electron) - Build cross platform desktop apps with JavaScript, HTML, and CSS
* [Vue](https://github.com/vuejs/vue) - JavaScript framework for building UI on the web
* [base64-img](https://github.com/douzi8/base64-img) - Convert img to base64, or convert base64 to img 
* [Bluebird](https://github.com/petkaantonov/bluebird) - Bluebird is a full featured promise library with unmatched performance
* [Fluent ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) - A fluent API to FFMPEG
* [node-potrace](https://github.com/tooolbox/node-potrace) - JavaScript port of Potrace, for NodeJS
* [svg2img](https://github.com/fuzhenn/node-svg2img) - A high-performance in-memory converter to convert svg to png/jpeg images for Node

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).


## Authors

* **Nick Jokić** - [GitHub](https://github.com/NickJokic)


## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/NickJokic/video-tracer/blob/master/LICENSE) file for details

## Acknowledgments

* Peter Selinger for [original Potrace tool and algorithm](http://potrace.sourceforge.net/)
* Iwasawafag for [node-potrace](https://github.com/Iwasawafag/node-potrace)
* Fuzhenn for [svg2img](https://github.com/fuzhenn/node-svg2img)
* Creators of [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)


