'use strict';

const temp = require('../../temp');
const CaptureProcessor = require('./capture-processor');
const RefChecker = require('./utils/reference-checker');
const Comparator = require('./utils/comparator');

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
            .then(() => RefChecker.create().hasAccessTo(referencePath))
            .then(() => Comparator.create().compareImages(currentPath, referencePath, compareOpts))
            .then((equal) => ({referencePath, currentPath, equal}));
    }
};
