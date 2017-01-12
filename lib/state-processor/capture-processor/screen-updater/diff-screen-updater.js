'use strict';

const temp = require('../../../temp');
const ScreenUpdater = require('./screen-updater');
const Updater = require('../utils/updater');
const Comparator = require('../utils/comparator');

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
            .then(() => Comparator.create().compareImages(currentPath, referencePath, compareOpts))
            .then((isEqual) => {
                return isEqual
                    ? false
                    : Updater.create().copy(currentPath, referencePath);
            });
    }
};
