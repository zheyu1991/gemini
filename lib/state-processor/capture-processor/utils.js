'use strict';

const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');

const Image = require('../../image');
const NoRefImageError = require('lib/errors/no-ref-image-error');

exports.compareImgs = (currPath, refPath, opts) => Image.compare(currPath, refPath, opts);

exports.copyImg = (currPath, refPath) => {
    return fs.copyAsync(currPath, refPath)
        .thenReturn(true);
};

exports.saveRef = (refPath, capture) => {
    return fs.mkdirsAsync(path.dirname(refPath))
        .then(() => capture.image.save(refPath))
        .thenReturn(true);
};

exports.existsRef = (refPath) => {
    return fs.accessAsync(refPath)
        .catch(() => Promise.reject(new NoRefImageError(refPath)));
};
