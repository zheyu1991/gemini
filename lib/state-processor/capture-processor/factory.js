'use strict';

const Promise = require('bluebird');
const CaptureProcessor = require('./index');
const utils = require('./utils');
const NoRefImageError = require('lib/errors/no-ref-image-error');

exports.create = (type) => {
    if (type === 'tester') {
        return CaptureProcessor.create()
            .onNoReference((refPath) => Promise.reject(new NoRefImageError(refPath)))
            .onEqual((refPath, currPath) => ({refPath, currPath, equal: true}))
            .onDiff((refPath, currPath) => ({refPath, currPath, equal: false}));
    }

    const notUpdated = (refPath) => ({imagePath: refPath, updated: false});
    const saveRef = (refPath, capture) => {
        return utils.saveRef(refPath, capture)
            .then((updated) => ({imagePath: refPath, updated}));
    };
    if (type === 'new-updater') {
        return CaptureProcessor.create()
            .onReference(notUpdated)
            .onNoReference(saveRef);
    }

    const updateRef = (refPath, currPath) => {
        return utils.copyImg(currPath, refPath)
            .then((updated) => ({imagePath: refPath, updated}));
    };
    if (type === 'diff-updater') {
        return CaptureProcessor.create()
            .onNoReference(notUpdated)
            .onEqual(notUpdated)
            .onDiff(updateRef);
    }

    if (type === 'meta-updater') {
        return CaptureProcessor.create()
            .onNoReference(saveRef)
            .onEqual(notUpdated)
            .onDiff(updateRef);
    }
};
