'use strict';

const fs = require('fs-extra');
const Promise = require('bluebird');
const RefChecker = require('lib/state-processor/capture-processor/utils/reference-checker');
const NoRefImageError = require('lib/errors/no-ref-image-error');

describe('state-processor/capture-processor/utils/reference-checker', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    it('should have static factory creation method', () => {
        assert.instanceOf(RefChecker.create(), RefChecker);
    });

    describe('hasAccessTo', () => {
        let refChecker;

        beforeEach(() => {
            sandbox.stub(fs, 'accessAsync');

            refChecker = RefChecker.create();
        });

        it('should fulfill promise if reference image exists', () => {
            fs.accessAsync.returns(Promise.resolve());

            return assert.isFulfilled(refChecker.hasAccessTo('existent/ref/path'));
        });

        it('should reject with error if reference image does not exist', () => {
            fs.accessAsync.returns(Promise.reject());

            return assert.isRejected(refChecker.hasAccessTo('nonexistent/ref/path'), NoRefImageError);
        });
    });
});
