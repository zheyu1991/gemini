'use strict';

const ScreenUpdater = require('./screen-updater');
const utils = require('../utils');

module.exports = class NewScreenUpdater extends ScreenUpdater {
    _processCapture(capture, opts, isRefExists) {
        return isRefExists
            ? false
            : utils.saveRef(opts.refPath, capture);
    }
};
