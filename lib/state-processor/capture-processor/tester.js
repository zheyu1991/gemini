'use strict';

const CaptureProcessor = require('./capture-processor');
const temp = require('../../temp');
const utils = require('./utils');

module.exports = class Tester extends CaptureProcessor {
    static create() {
        return new Tester();
    }

    exec(capture, opts) {
        const referencePath = opts.refPath;
        const currentPath = temp.path({suffix: '.png'});
        const compareOpts = {
            canHaveCaret: capture.canHaveCaret,
            tolerance: opts.tolerance,
            pixelRatio: opts.pixelRatio
        };

        return capture.image.save(currentPath)
            .then(() => utils.existsRef(referencePath))
            .then(() => utils.compareImgs(currentPath, referencePath, compareOpts))
            .then((equal) => ({referencePath, currentPath, equal}));
    }
};
