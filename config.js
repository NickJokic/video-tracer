/* Used for setting up the path to ffmpeg binaries */

var ffmpegPath = require('ffmpeg-static').path.replace('app.asar', 'app.asar.unpacked');
var ffprobePath = require('ffprobe-static').path.replace('app.asar', 'app.asar.unpacked');

module.exports = {
  ffmpegPath: ffmpegPath,
  ffprobePath: ffprobePath
};
