'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');
const proxyquire = require('proxyquire');

const temp = require('lib/temp');
const Image = require('lib/image');
const Tester = require('lib/state-processor/capture-processor/tester');
const NoRefImageError = require('lib/errors/no-ref-image-error');
const utils = require('lib/state-processor/capture-processor/utils');

describe('state-processor/capture-processor/tester', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    it('should have static factory creation method', () => {
        assert.instanceOf(Tester.create(), Tester);
    });

    describe('exec', () => {
        let imageStub;
        let utilsStub;

        const exec_ = (opts) => {
            opts = _.defaults(opts || {}, {
                refPath: '/default/path'
            });

            const capture = {
                canHaveCaret: true,
                image: imageStub
            };
            const TesterStub = proxyquire('lib/state-processor/capture-processor/tester', {
                './utils': utilsStub
            });

            return new TesterStub().exec(capture, opts);
        };

        beforeEach(() => {
            sandbox.stub(fs, 'accessAsync').returns(Promise.resolve());
            sandbox.stub(temp, 'path');

            imageStub = sinon.createStubInstance(Image);
            imageStub.save.returns(Promise.resolve());

            utilsStub = {
                existsRef: sandbox.stub(),
                compareImgs: sandbox.stub()
            };
        });

        it('should save current image with "png" extension', () => {
            return exec_().then(() => assert.calledWith(temp.path, {suffix: '.png'}));
        });

        it('should save current image to the temporary directory', () => {
            temp.path.returns('/temp/path');

            return exec_()
                .then(() => {
                    assert.calledOnce(imageStub.save);
                    assert.calledWith(imageStub.save, '/temp/path');
                });
        });

        it('should save current image before checking that reference image exists', () => {
            return exec_().then(() => assert.callOrder(imageStub.save, utilsStub.existsRef));
        });

        it('should be rejected with `NoRefImageError` if reference image does not exist', () => {
            fs.accessAsync.returns(Promise.reject());
            utilsStub.existsRef = utils.existsRef;

            return assert.isRejected(exec_({refPath: '/non-existent/path'}), NoRefImageError);
        });

        it('should compare images with given set of parameters', () => {
            temp.path.returns('/temp/path');

            const options = {
                refPath: '/ref/path',
                pixelRatio: 99,
                tolerance: 23
            };

            return exec_(options)
                .then(() => {
                    assert.calledWith(utilsStub.compareImgs, '/temp/path', '/ref/path', {
                        canHaveCaret: true,
                        pixelRatio: 99,
                        tolerance: 23
                    });
                });
        });

        it('should compare images after checking that reference image exists', () => {
            utilsStub.existsRef.returns(Promise.resolve());

            return exec_().then(() => assert.callOrder(utilsStub.existsRef, utilsStub.compareImgs));
        });

        it('should return image comparison result', () => {
            utilsStub.existsRef.returns(Promise.resolve());
            utilsStub.compareImgs.returns(true);
            temp.path.returns('/temp/path');

            return exec_({refPath: '/ref/path'})
                .then((result) => {
                    assert.deepEqual(result, {
                        currentPath: '/temp/path',
                        referencePath: '/ref/path',
                        equal: true
                    });
                });
        });
    });
});
