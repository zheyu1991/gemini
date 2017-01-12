'use strict';

const Image = require('../../../image');

module.exports = class Comparator {
    static create() {
        return new Comparator();
    }

    compareImages(currentPath, referencePath, opts) {
        return Image.compare(currentPath, referencePath, opts);
    }
};
