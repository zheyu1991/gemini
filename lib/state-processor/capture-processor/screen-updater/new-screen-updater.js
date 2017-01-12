'use strict';

const ScreenUpdater = require('./screen-updater');
const Updater = require('../utils/updater');

module.exports = class NewScreenUpdater extends ScreenUpdater {
    _processCapture(capture, opts, isRefExists) {
        return isRefExists
            ? false
            : Updater.create(capture).save(opts.refPath);
    }
};
