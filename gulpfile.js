var gulp          = require('gulp');
var autoprefixer  = require('gulp-autoprefixer');
var debug         = require('gulp-debug');
var s3            = require('gulp-s3');
var sass          = require('gulp-sass');
var svgSprite     = require('gulp-svg-sprites');
var connect       = require('gulp-connect');
var exec          = require('child_process').exec;

var paths = {
  sass:          'src/sass',
  css:           'src/css',
  svg:           'src/svg',
  build: {
    img:         'styleguide/assets/img',
    css:         'styleguide/assets/style',
    svg:         'styleguide/assets/svg'
  }
};

gulp.task('default', ['sprite', 'sass', 'kss', 'connect', 'watch']);

gulp.task('watch', function () {
  gulp.watch(paths.sass + '/**/*.scss', ['sass', 'kss']);
  gulp.watch(paths.sass + '/**/*.hbs', ['kss']);
  gulp.watch(paths.svg + '/**/*.svg', ['sprite', 'kss']);
});

gulp.task('connect', function () {
  connect.server({
    root: 'styleguide',
    livereload: true
  });
});

gulp.task('kss', ['sass'], function (cb) {
  exec('kss-node --config=kss-config.json', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}),

gulp.task('sass', function () {
  return gulp.src(paths.sass + '/*.scss')
    .pipe(debug())
    .pipe(sass({
      imagePath: paths.build.img,
      style: 'expanded',
      includePaths: '/node_modules/bootstrap-sass/assets/stylesheets/'
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.build.css))
    .pipe(connect.reload());
});

gulp.task('sprite', function () {
  return gulp.src(paths.svg + '/*.svg')
    .pipe(svgSprite({
      mode: 'symbols',
      preview: false,
      svg: {
        symbols: 'symbols.svg'
      }
    }))
    .pipe(gulp.dest(paths.build.svg));
});

gulp.task('publish', ['styleguide'], function () {
  var awsConfig = require('./awsConfig');
  return gulp.src('./styleguide/**/*')
    .pipe(s3(awsConfig));
});
