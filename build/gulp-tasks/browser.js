const browserify = require('browserify');
const source  = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
//const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const { src, dest } = require('gulp');

const files = {
  jsMain: './lib/index.js',
  jsOutput: 'alienWarz.js'
}

module.exports = function browser () {
  return browserify(files.jsMain, {
    entries: './lib/index.js',
    standalone: 'alienWarz',
    debug: true
  })
  .bundle()
  .pipe(source(files.jsOutput))
  .pipe(buffer())
  .pipe(dest('public/js'))
  .pipe(rename({ extname: ".min.js" }))
};

