'use strict';

const fs = require('fs-extra');
const path = require('path');
const Image = require('../../image');

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

exports.existsRef = (refPath) => fs.accessAsync(refPath);
