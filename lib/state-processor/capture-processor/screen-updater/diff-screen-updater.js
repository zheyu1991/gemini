'use strict';

const temp = require('../../../temp');
const ScreenUpdater = require('./screen-updater');
const utils = require('../utils');

module.exports = class DiffScreenUpdater extends ScreenUpdater {
    _processCapture(capture, opts, isRefExists) {
        if (!isRefExists) {
            return false;
        }

        const referencePath = opts.refPath;
        const currentPath = temp.path({suffix: '.png'});
        const compareOpts = {
            canHaveCaret: capture.canHaveCaret,
            tolerance: opts.tolerance,
            pixelRatio: opts.pixelRatio
        };

        return capture.image.save(currentPath)
            .then(() => utils.compareImgs(currentPath, referencePath, compareOpts))
            .then((isEqual) => {
                return isEqual
                    ? false
                    : utils.copyImg(currentPath, referencePath);
            });
    }
};
