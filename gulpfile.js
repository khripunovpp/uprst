const {src, dest, watch, parallel, series} = require('gulp')
const pug = require('gulp-pug')
const prettier = require('gulp-prettier');
const sass = require('gulp-sass')(require('sass'));
sass.compiler = require("sass");
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create()
const cleancss = require('gulp-clean-css');
const rollup = require('gulp-rollup');
const rename = require('gulp-rename');
const del = require('del');


const dist = 'docs/';

function browsersync() {
    browserSync.init({ // Инициализация Browsersync
        server: {baseDir: dist + ''}, // Указываем папку сервера
        notify: false, // Отключаем уведомления
        online: true // Режим работы: true или false
    })
}

function styles() {
    return src('src/scss/main.scss') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
        .pipe(sass())
        .pipe(concat('styles.min.css')) // Конкатенируем в файл app.min.js
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        })) // Создадим префиксы с помощью Autoprefixer
        .pipe(cleancss({level: {1: {specialComments: 0}}/* , format: 'beautify' */})) // Минифицируем стили
        .pipe(dest(dist + 'css/')) // Выгрузим результат в папку "app/css/"
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function stylesRaw() {
    return src([
        "src/css/*.css",
    ])
        .pipe(dest(dist + 'css/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function scripts() {
    const entries = [
        './src/js/main.js',
    ];
    return src(entries)
        .pipe(rollup({
            allowRealFiles: true,
            input: entries,
            format: 'iife',
            moduleName: 'main',
        }))
        .pipe(dest(dist + 'js/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function libsscripts() {
    const entries = [
        'src/js/libs/jquery.lazy.js',
        'src/js/libs/wow.min.js',
    ];
    return src(entries)
        .pipe(concat('libs.min.js')) // Конкатенируем в один файл
        .pipe(dest(dist + 'js/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function scriptsRaw() {
    return src([
        'src/js/libs/jquery-3.6.1.min.js',
    ])
        .pipe(dest(dist + 'js/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function fonts() {
    return src('src/fonts/**/*')
        .pipe(dest(dist + 'fonts/'))
        .pipe(browserSync.stream())
}

function images() {
    return src('src/img/**/*')
        .pipe(dest(dist + 'img/'))
        .pipe(browserSync.stream())
}

function views() {
    return src('src/pug/**/*.pug')
        .pipe(pug({
            pretty: true,
        }))
        .pipe(dest(dist + ''))
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function startwatch(done) {
    // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
    watch(['src/**/*.js'], parallel(scripts));
    watch('src/**/*.scss', styles);
    watch('src/**/*.html', views).on('change', browserSync.reload)
    watch('src/**/*.pug', views).on('change', browserSync.reload)
    done();
}

exports.default = parallel(styles, stylesRaw, libsscripts, scriptsRaw, scripts, views, images, browsersync, startwatch);

exports.build = function (done) {
    return parallel(libsscripts, scriptsRaw, stylesRaw, scripts, views, images)(done);
}