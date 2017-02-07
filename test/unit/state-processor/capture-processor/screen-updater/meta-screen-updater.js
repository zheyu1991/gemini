'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');

const temp = require('lib/temp');
const Image = require('lib/image');
const MetaScreenUpdater = require('lib/state-processor/capture-processor/screen-updater/meta-screen-updater');

describe('meta-screen-updater', () => {
    const sandbox = sinon.sandbox.create();

    let imageStub;

    const exec_ = (opts) => {
        opts = _.defaults(opts || {}, {
            refPath: '/default/path'
        });

        const capture = {image: imageStub};

        return new MetaScreenUpdater().exec(capture, opts);
    };

    beforeEach(() => {
        sandbox.stub(fs);
        sandbox.stub(temp, 'path');
        sandbox.stub(Image, 'compare').returns(Promise.resolve());

        imageStub = sinon.createStubInstance(Image);
        imageStub.save.returns(Promise.resolve());

        fs.copyAsync.returns(Promise.resolve());
    });

    afterEach(() => sandbox.restore());

    it('should check once that reference image exists', () => {
        fs.accessAsync.returns(Promise.resolve());

        return exec_({refPath: '/ref/path'})
            .then(() => {
                assert.calledOnce(fs.accessAsync);
                assert.calledWith(fs.accessAsync, '/ref/path');
            });
    });

    it('should save current image to the temporary directory', () => {
        fs.accessAsync.returns(Promise.resolve());
        temp.path.returns('/temp/path');

        return exec_()
            .then(() => {
                assert.calledOnce(imageStub.save);
                assert.calledWith(imageStub.save, '/temp/path');
            });
    });

    it('should save new reference image if it does not exist', () => {
        fs.accessAsync.returns(Promise.reject());
        fs.mkdirsAsync.returns(Promise.resolve());

        return exec_({refPath: '/ref/path'})
            .then(() => {
                assert.calledOnce(imageStub.save);
                assert.calledWith(imageStub.save, '/ref/path');
            });
    });
});
