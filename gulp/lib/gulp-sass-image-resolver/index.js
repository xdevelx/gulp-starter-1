/**
 * @since       12.10.2016 11:19
 * @author      delphinpro <delphinpro@gmail.com>
 * @copyright   copyright © 2016 delphinpro
 * @license     licensed under the MIT license
 */

"use strict";

const gulpUtil = require('gulp-util');
const through = require('through2');

var PLUGIN_NAME = 'gulp-sass-image-resolver';

module.exports = function(options) {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gulpUtil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        try {
            var content = file.contents.toString();

            if (/\.css$/.exec(file.path) !== null) {
                if (/url\("(.+?)"\)/.exec(content) !== null) {
                    var match;
                    var pattern = /url\("(.+?)"\)/g;

                    while ((match = pattern.exec(content)) !== null) {
                        var found = match[1];
                        var result = found.replace(options.source, options.replacement);
                        content = content.replace(found, result);
                    }

                    file.contents = new Buffer(content);
                }
            }
        } catch (err) {
            this.emit('error', new PluginError(PLUGIN_NAME, err));
        }

        this.push(file);
        cb();
    });
};
