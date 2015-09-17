var gulp = require('gulp'),
    typescript = require('gulp-typescript');

/*
 * Create variables for our project paths so we can change in one place
 */
var paths = {
    'typescript': './src/ts/**/*.ts',
    'tsBuildTarget': './public/js',
    'javascript': './public/js/**/*/js'
};

gulp.task('typescript', [], function(){

  return gulp.src(paths.typescript)
    .pipe(typescript({
        module: 'commonjs'
    }))
    .pipe(gulp.dest(paths.tsBuildTarget));

});

gulp.task('watch', function() {

    gulp.start('typescript');
    gulp.watch(paths.typescript, ['typescript']);

});