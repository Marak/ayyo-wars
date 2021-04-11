const gulp = require('gulp');

function defaultTask(cb) {
  // place code for your default task here
  console.log('please run gulp --tasks to see available tasks for alien warz')
  console.log('you can then try running a command like `gulp readme`')
  cb();
}

let browser = exports.browser = require('./build/gulp-tasks/browser');

exports.watch = function () {
  gulp.watch('./lib/index.js', browser);
  gulp.watch('./lib/behaviors/index.js', browser);
  gulp.watch('./lib/behaviors/**/*', browser);
  gulp.watch('./lib/Geoffrey/*', browser);
  gulp.watch('./lib/inputs/*', browser);
  gulp.watch('./lib/utils/*', browser);
}

exports.default = defaultTask
