'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');

const Image = require('lib/image');
const temp = require('lib/temp');
const Updater = require('lib/state-processor/capture-processor/utils/updater');
const Comparator = require('lib/state-processor/capture-processor/utils/comparator');
const DiffScreenUpdater = require('lib/state-processor/capture-processor/screen-updater/diff-screen-updater');

describe('diff-screen-updater', () => {
    const sandbox = sinon.sandbox.create();

    let imageStub;
    let updater;
    let comparator;

    const exec_ = (opts) => {
        opts = _.defaults(opts || {}, {
            refPath: 'default/path'
        });

        const capture = {image: imageStub};

        return new DiffScreenUpdater().exec(capture, opts);
    };

    beforeEach(() => {
        sandbox.stub(temp, 'path');
        sandbox.stub(fs, 'accessAsync').returns(Promise.resolve());

        imageStub = sinon.createStubInstance(Image);
        imageStub.save.returns(Promise.resolve());

        updater = {copy: sandbox.stub()};
        sandbox.stub(Updater, 'create').returns(updater);

        comparator = {compareImages: sandbox.stub()};
        sandbox.stub(Comparator, 'create').returns(comparator);
    });

    afterEach(() => sandbox.restore());

    it('should save image to the temp directory before comparing', () => {
        temp.path.returns('/temp/path');

        return exec_()
            .then(() => {
                assert.calledOnce(imageStub.save);
                assert.calledWith(imageStub.save, '/temp/path');
            });
    });

    it('should not compare images if reference image does not exist', () => {
        fs.accessAsync.returns(Promise.reject());

        return exec_()
            .then(() => assert.notCalled(comparator.compareImages));
    });

    it('should not save image if images are the same', () => {
        comparator.compareImages.returns(true);

        return exec_()
            .then(() => assert.notCalled(updater.copy));
    });

    it('should save image if images are different', () => {
        comparator.compareImages.returns(false);
        temp.path.returns('/temp/path');

        return exec_({refPath: '/ref/path'})
            .then(() => assert.calledWith(updater.copy, '/temp/path', '/ref/path'));
    });

    it('should save image with correct suffix', () => {
        comparator.compareImages.returns(false);

        return exec_()
            .then(() => assert.calledWith(temp.path, {suffix: '.png'}));
    });
});
