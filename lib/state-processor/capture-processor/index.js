'use strict';

const Promise = require('bluebird');
const utils = require('./utils');
const temp = require('../../temp');
const NoRefImageError = require('lib/errors/no-ref-image-error');

module.exports = class CaptureProcessor {
    static create() {
        return new CaptureProcessor();
    }

    constructor() {
        this._onRefHandler = null;
        this._onNoRefHandler = null;
        this._onEqualHandler = null;
        this._onDiffHandler = null;
    }

    onReference(handler) {
        this._onRefHandler = handler;
        return this;
    }

    onNoReference(handler) {
        this._onNoRefHandler = handler;
        return this;
    }

    onEqual(handler) {
        this._onEqualHandler = handler;
        return this;
    }

    onDiff(handler) {
        this._onDiffHandler = handler;
        return this;
    }

    exec(capture, opts) {
        const refPath = opts.refPath;

        return utils.existsRef(refPath)
            .then((isRefExists) => {
                if (!isRefExists) {
                    return this._onNoRefHandler
                        ? this._onNoRefHandler(refPath, capture)
                        : Promise.reject(new NoRefImageError(refPath));
                }

                if (!this._onEqualHandler && !this._onDiffHandler) {
                    return this._onRefHandler
                        ? this._onRefHandler(refPath)
                        : Promise.reject(new Error('equal and diff handlers should be initialized'));
                }

                return this._compareImages(capture, opts);
            });
    }

    _compareImages(capture, opts) {
        const refPath = opts.refPath;
        const currPath = temp.path({suffix: '.png'});
        const compareOpts = {
            canHaveCaret: capture.canHaveCaret,
            tolerance: opts.tolerance,
            pixelRatio: opts.pixelRatio
        };

        return capture.image.save(currPath)
            .then(() => utils.compareImgs(currPath, refPath, compareOpts))
            .then((isEqual) => isEqual
                ? this._onEqualHandler(refPath, currPath)
                : this._onDiffHandler(refPath, currPath)
            );
    }
};
