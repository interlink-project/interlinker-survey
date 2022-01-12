
var browserify = require('browserify');
var gulp = require('gulp');
var babel = require('gulp-babel');
var source = require('vinyl-source-stream');

gulp.task("jsx_to_js", function () {
    return gulp.src("*.jsx").
    pipe(babel({
        plugins: ['transform-react-jsx']
    })).
    pipe(gulp.dest("js/"));
})

gulp.task("bundle_editor", function () {
    return browserify('js/editor.js')
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('editor.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('./build'));
})


gulp.task("default", gulp.series('jsx_to_js', 'bundle_editor'));
