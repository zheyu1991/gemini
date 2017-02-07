'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');
const proxyquire = require('proxyquire');

const Image = require('lib/image');
const temp = require('lib/temp');

describe('diff-screen-updater', () => {
    const sandbox = sinon.sandbox.create();

    let imageStub;
    let utilsStub;

    const exec_ = (opts) => {
        opts = _.defaults(opts || {}, {
            refPath: '/default/path'
        });

        const capture = {image: imageStub};
        const DiffScreenUpdater = proxyquire(
            'lib/state-processor/capture-processor/screen-updater/diff-screen-updater',
            {'../utils': utilsStub}
        );

        return new DiffScreenUpdater().exec(capture, opts);
    };

    beforeEach(() => {
        sandbox.stub(temp, 'path');
        sandbox.stub(fs, 'accessAsync').returns(Promise.resolve());

        imageStub = sinon.createStubInstance(Image);
        imageStub.save.returns(Promise.resolve());

        utilsStub = {
            compareImgs: sandbox.stub(),
            copyImg: sandbox.stub()
        };
    });

    afterEach(() => sandbox.restore());

    it('should not save current image if reference image does not exist', () => {
        fs.accessAsync.returns(Promise.reject());

        return exec_({refPath: '/non-existent/path'})
            .then((res) => {
                assert.notCalled(imageStub.save);
                assert.deepEqual(res, {
                    imagePath: '/non-existent/path',
                    updated: false
                });
            });
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

    it('should save current image before comparing with reference image', () => {
        return exec_().then(() => assert.callOrder(imageStub.save, utilsStub.compareImgs));
    });

    it('should not copy current image to reference path if images are the same', () => {
        utilsStub.compareImgs.returns(true);

        return exec_()
            .then((res) => {
                assert.notCalled(utilsStub.copyImg);
                assert.propertyVal(res, 'updated', false);
            });
    });

    it('should copy current image to reference path if images are different', () => {
        utilsStub.compareImgs.returns(false);
        utilsStub.copyImg.returns(true);
        temp.path.returns('/temp/path');

        return exec_({refPath: '/ref/path'})
            .then((res) => {
                assert.calledWith(utilsStub.copyImg, '/temp/path', '/ref/path');
                assert.propertyVal(res, 'updated', true);
            });
    });

    it('should copy current image to reference path after comparing', () => {
        utilsStub.compareImgs.returns(false);

        return exec_()
            .then(() => assert.callOrder(utilsStub.compareImgs, utilsStub.copyImg));
    });
});
