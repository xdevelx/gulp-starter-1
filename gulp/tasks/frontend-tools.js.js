/**
 * Compile script for tools
 *
 * @author      delphinpro <delphinpro@gmail.com>
 * @copyright   copyright © 2017 delphinpro
 * @license     licensed under the MIT license
 */

const bs             = require('browser-sync');
const path           = require('path');
const gulp           = require('gulp');
const changedInPlace = require('gulp-changed-in-place');
const notify         = require('../lib/handleErrors');
const webpack        = require('webpack');
const webpackStream  = require('piped-webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const nodeEnv          = global.development ? 'development' : 'production';
const cssLoaderOptions = {minimize: true, url: false};

module.exports = function (options) {

    const paths = {
        index : path.join('gulp/frontend-tools/', '*.*'),
        output: {
            root  : options.root.build,
            assets: path.join(options.root.build, 'frontend-tools'),
        },
    };

    let webpackConfig = {
        // entry  : 'gulp/frontend-tools/js/dev.js',
        mode   : nodeEnv,
        cache  : true,
        output : {
            path         : __dirname + '../../../',
            filename     : 'dev.js',
            chunkFilename: '[chunkhash].js',
        },
        // watch  : true,
        devtool: 'inline-cheap-source-map',
        module : {
            rules: [
                {
                    test   : /\.scss$/,
                    exclude: [/node_modules/],
                    use    : [
                        {loader: 'style-loader'},
                        {loader: 'css-loader', options: cssLoaderOptions},
                        {loader: 'sass-loader', options: {outputStyle: 'compressed'}},
                    ],
                },
                {
                    test   : /\.js$/,
                    exclude: [/node_modules/],
                    loader : 'babel-loader',
                },
            ],
        },
        resolve: {
            modules   : ['node_modules'],
            extensions: ['.js'],
        },
        plugins: [
            new webpack.NoEmitOnErrorsPlugin(),

            new UglifyJsPlugin({
                sourceMap    : true,
                parallel     : true,
                uglifyOptions: {
                    warnings: false,
                    output  : {
                        comments: /^\**!|@preserve/,
                    },
                },
            }),

            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(nodeEnv),
            }),
        ],
    };

    return function (done) {

        let bsHasInstance = global.development && bs.has(options.bs.instance);
        let bsInstance, interval;

        if (bsHasInstance) {
            bsInstance = bs.get(options.bs.instance);
            interval   = setInterval(function () {
                bsInstance.notify('<span style="color:red">Tools is compiles...</span>', 5000);
            }, 300);
        }

        let pipeline = gulp.src('gulp/frontend-tools/js/dev.js')
            .pipe(webpackStream(webpackConfig)).on('error', notify)
            .pipe(changedInPlace({firstPass: true}))
            .pipe(gulp.dest(paths.output.assets))
        ;

        if (bsHasInstance) {
            pipeline = pipeline.on('end', function () {
                clearInterval(interval);
                bsInstance.reload();
            });
        }

        return pipeline;
    };
};
