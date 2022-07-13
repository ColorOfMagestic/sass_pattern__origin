const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const webpImages = require('gulp-webp');
const svgSprite = require('gulp-svg-sprite');
const del = require("del");

const ttf2woff2 = require("gulp-ttf2woff2");
const ttf2woff = require("gulp-ttf2woff");


function woff2() {
  return src(["app/fonts/src/*.ttf"])
    .pipe(ttf2woff2())
    .pipe(dest("app/fonts/dist"));
}

function woff() {
  return src(["app/fonts/src/*.ttf"])
    .pipe(ttf2woff())
    .pipe(dest("app/fonts/dist"));
}

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
    cors: true,
    browser: "firefox",
    notify: false,
    ui: false,
  });
}

function cleanDist() {
  return del("dist");
}

function transformImages() {
  return src("app/img/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("app/img"));
}

function sprite() {
  const config = {
    shape: {
      id: {
        separator: '__'
      },
      dimension: {
        maxWidth: 64,
        maxHeight: 64
      },
    },
    mode: {
      symbol: {
        dest : '.',
        sprite: 'sprite.svg'
      }
    }
  };
  
  return src('app/for_sprite/*.svg')
  .pipe(svgSprite(config))
  .pipe(dest('app/img/'));
}

function webp() {
  return src('app/img/*.{png,jpg}')
  .pipe(webpImages())
  .pipe(dest('app/img/webp'))
}


function scripts() {
  return src(["app/js/src/*.js"])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function styles() {
  return src("app/scss/style.scss")
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(concat("style.min.css"))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 version"],
        grid: true,
      })
    )
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

// Сборка в отдельный проект
function build() {
  return src(
    [
      "app/css/style.min.css",
      "app/fonts/**/*",
      "app/img/**/*",
      "app/js/*.js",
      "app/*.html",
      "app/PHPMailer/**/*",
      "app/*.php"
    ],
    { base: "app" }
  ).pipe(dest("dist"));
}

function watching() {
  watch(["app/scss/**/*.scss"], styles);
  watch(["app/js/src/**/*.js", "!app/js/main.min.js"], scripts);
  watch(["app/*.html"]).on("change", browserSync.reload);
}

// gulp styles - Преобразовать *.scss в .css и сохранить в app/css
exports.styles = styles;
// gulp watching - Следить за изменениями в проекте
exports.watching = watching;
// gulp browsersync - Запустить browsersync в live режиме
exports.browsersync = browsersync;
// gulp scripts - Следить за изменениями в скриптах JS
exports.scripts = scripts;
// gulp images - Сжатие изображений и сохранение в /dist/images
exports.transformImages = transformImages;
exports.sprite = sprite;
exports.webp = webp;
exports.images = parallel(transformImages, sprite, webp);
// gulp del - Удалить папку /dist
exports.cleanDist = cleanDist;
// gulp fonts
exports.woff = woff;
exports.woff2 = woff2;
exports.fonts = parallel(woff, woff2);

// gulp build - Удаление и перезапись содержимого папки /dist
exports.build = series(cleanDist, build);
// gulp - Запуск всех команд
exports.default = parallel(styles, scripts, browsersync, watching, sprite);
