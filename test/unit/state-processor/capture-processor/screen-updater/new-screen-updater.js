'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');
const proxyquire = require('proxyquire');

const Image = require('lib/image');

describe('new-screen-updater', () => {
    const sandbox = sinon.sandbox.create();

    let imageStub;
    let utilsStub;

    const exec_ = (opts) => {
        opts = _.defaults(opts || {}, {
            refPath: '/default/path'
        });

        const capture = {image: imageStub};
        const NewScreenUpdater = proxyquire(
            'lib/state-processor/capture-processor/screen-updater/new-screen-updater',
            {'../utils': utilsStub}
        );

        return new NewScreenUpdater().exec(capture, opts);
    };

    beforeEach(() => {
        sandbox.stub(fs, 'accessAsync');

        imageStub = sinon.createStubInstance(Image);
        utilsStub = {saveRef: sandbox.stub()};
    });

    afterEach(() => sandbox.restore());

    it('should not save reference image if it already exists', () => {
        fs.accessAsync.returns(Promise.resolve());

        return exec_({refPath: '/existent/path'})
            .then((res) => {
                assert.notCalled(utilsStub.saveRef);
                assert.deepEqual(res, {
                    imagePath: '/existent/path',
                    updated: false
                });
            });
    });

    it('should save reference image if it does not exist', () => {
        fs.accessAsync.returns(Promise.reject());
        utilsStub.saveRef.returns(true);

        return exec_({refPath: '/ref/path'})
            .then((res) => {
                assert.calledWith(utilsStub.saveRef, '/ref/path', {image: imageStub});
                assert.propertyVal(res, 'updated', true);
            });
    });
});
