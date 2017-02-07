'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');

const Image = require('lib/image');
const NoRefImageError = require('lib/errors/no-ref-image-error');
const utils = require('lib/state-processor/capture-processor/utils');

describe('state-processor/capture-processor/utils', () => {
    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
        sandbox.stub(fs);
    });

    afterEach(() => sandbox.restore());

    describe('compareImgs', () => {
        it('should pass through all arguments to image comparator', () => {
            sandbox.stub(Image, 'compare').returns(Promise.resolve());

            return utils.compareImgs('/temp/path', '/ref/path', {canHaveCaret: true})
                .then(() => assert.calledWith(Image.compare, '/temp/path', '/ref/path', {canHaveCaret: true}));
        });
    });

    describe('copyImg', () => {
        it('should copy current image to reference path', () => {
            fs.copyAsync.returns(Promise.resolve());

            return utils.copyImg('/temp/path', '/ref/path')
                .then((res) => {
                    assert.calledWith(fs.copyAsync, '/temp/path', '/ref/path');
                    assert.isTrue(res);
                });
        });
    });

    describe('saveRef', () => {
        let imageStub;

        const save_ = (opts) => {
            opts = _.defaults(opts || {}, {
                refPath: '/non/relevant.png'
            });

            let capture = {image: imageStub};

            return utils.saveRef(opts.refPath, capture);
        };

        beforeEach(() => {
            imageStub = sinon.createStubInstance(Image);
            imageStub.save.returns(Promise.resolve());
        });

        it('should make directory before saving the image', () => {
            const mediator = sinon.spy().named('mediator');

            fs.mkdirsAsync.returns(Promise.delay(50).then(mediator));

            return save_()
                .then(() => assert.callOrder(fs.mkdirsAsync, mediator, imageStub.save));
        });

        it('should save image with given path', () => {
            fs.mkdirsAsync.returns(Promise.resolve());

            return save_({refPath: '/ref/path'})
                .then((res) => {
                    assert.calledWith(imageStub.save, '/ref/path');
                    assert.isTrue(res);
                });
        });
    });

    describe('existsRef', () => {
        it('should fulfill promise if reference image exists', () => {
            fs.accessAsync.returns(Promise.resolve());

            return assert.isFulfilled(utils.existsRef('/existent/path'));
        });

        it('should reject with error if reference image does not exist', () => {
            fs.accessAsync.returns(Promise.reject());

            return assert.isRejected(utils.existsRef('/non-existent/path'), NoRefImageError);
        });
    });
});
