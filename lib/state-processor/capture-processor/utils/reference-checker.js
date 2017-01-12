'use strict';

const fs = require('fs-extra');
const Promise = require('bluebird');
const NoRefImageError = require('../../../errors/no-ref-image-error');

module.exports = class RefChecker {
    static create() {
        return new RefChecker();
    }

    hasAccessTo(referencePath) {
        return fs.accessAsync(referencePath)
            .catch(() => Promise.reject(new NoRefImageError(referencePath)));
    }
};
