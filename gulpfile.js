var gulp = require('gulp');
var rename = require('gulp-rename');

gulp.task('example', function () {

    gulp.src('./node_modules/leaflet/dist/**/*')
        .pipe(gulp.dest('./example/vendors/leaflet'));

    gulp.src('./index.js')
    .pipe(rename('leaflet-tilelayer-customcrs.js'))
    .pipe(gulp.dest('./example/vendors'));

});
