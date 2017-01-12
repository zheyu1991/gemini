'use strict';

const fs = require('fs-extra');
const path = require('path');

module.exports = class Updater {
    constructor(capture) {
        this._capture = capture;
    }

    static create(capture) {
        return capture
            ? new Updater(capture)
            : new Updater();
    }

    copy(currentPath, referencePath) {
        return fs.copyAsync(currentPath, referencePath).thenReturn(true);
    }

    save(referencePath) {
        return fs.mkdirsAsync(path.dirname(referencePath))
            .then(() => this._capture.image.save(referencePath))
            .thenReturn(true);
    }
};
