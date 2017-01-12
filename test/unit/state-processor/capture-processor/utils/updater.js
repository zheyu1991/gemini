'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');
const Image = require('lib/image');
const Updater = require('lib/state-processor/capture-processor/utils/updater');

describe('state-processor/capture-processor/utils/updater', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    it('should have static factory creation method', () => {
        assert.instanceOf(Updater.create(), Updater);
    });

    describe('copy', () => {
        beforeEach(() => {
            sandbox.stub(fs, 'copyAsync');
        });

        it('should save current image to reference path', () => {
            fs.copyAsync.returns(Promise.resolve());

            return Updater.create().copy('temp/path', 'ref/path')
                .then(() => assert.calledWith(fs.copyAsync, 'temp/path', 'ref/path'));
        });
    });

    describe('save', () => {
        let imageStub;

        beforeEach(() => {
            sandbox.stub(fs, 'mkdirsAsync');

            imageStub = sinon.createStubInstance(Image);
            imageStub.save.returns(Promise.resolve());
        });

        const save_ = (opts) => {
            opts = _.defaults(opts || {}, {
                refPath: '/non/relevant.png'
            });

            let capture = _.set({}, 'image', imageStub);

            return Updater.create(capture).save(opts.refPath);
        };

        it('should make directory before saving the image', () => {
            const mediator = sinon.spy().named('mediator');

            fs.mkdirsAsync.returns(Promise.delay(50).then(mediator));

            return save_()
                .then(() => {
                    assert.callOrder(
                        fs.mkdirsAsync,
                        mediator,
                        imageStub.save
                    );
                });
        });

        it('should save image with correct path', () => {
            fs.mkdirsAsync.returns(Promise.resolve());

            return save_({refPath: '/ref/path'})
                .then(() => {
                    assert.calledWith(imageStub.save, '/ref/path');
                });
        });
    });
});
