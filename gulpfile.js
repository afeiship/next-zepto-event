(function () {

  /**
   * <script type="text/javascript" src="event-util.js"></script>
   <script type="text/javascript" src="event-object.js"></script>
   <script type="text/javascript" src="event-core.js"></script>
   <script type="text/javascript" src="event-static.js"></script>
   <script type="text/javascript" src="event-proto.js"></script>
   * @type {Gulp|exports|module.exports}
   */
  var gulp = require('gulp');
  var del = require('del');
  var concat = require('gulp-concat');
  var rename = require('gulp-rename');
  var uglify = require('gulp-uglify');
  var conf = {
    src: 'src',
    dist: 'dist'
  };

  gulp.task('clean', function () {
    del(conf.dist);
  });

  gulp.task('uglify', ['clean'], function () {
    gulp.src([
        conf.src + '/event-util.js',
        conf.src + '/event-object.js',
        conf.src + '/event-core.js',
        conf.src + '/event-static.js',
        conf.src + '/event-proto.js'
      ])
      .pipe(concat('next-dom-event.js'))
      .pipe(uglify())
      //.pipe(rename({
      //  extname: '.min.js'
      //}))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('default', ['uglify']);

}());
