'use strict';

const CaptureProcessorFactory = require('./factory');

exports.create = (opts) => {
    if (opts.diff && !opts.new) {
        return CaptureProcessorFactory.create('diff-updater');
    }
    if (!opts.diff && opts.new) {
        return CaptureProcessorFactory.create('new-updater');
    }
    return CaptureProcessorFactory.create('meta-updater');
};
