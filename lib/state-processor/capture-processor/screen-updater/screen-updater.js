'use strict';

const CaptureProcessor = require('../capture-processor');
const RefChecker = require('../utils/reference-checker');

module.exports = class ScreenUpdater extends CaptureProcessor {
    exec(capture, opts) {
        const refPath = opts.refPath;

        return RefChecker.create().hasAccessTo(refPath)
            .then(
                () => this._processCapture(capture, opts, true),
                () => this._processCapture(capture, opts, false)
            )
            .then((updated) => ({imagePath: refPath, updated}));
    }

    _processCapture() {
        throw new Error('Not implemented');
    }
};
