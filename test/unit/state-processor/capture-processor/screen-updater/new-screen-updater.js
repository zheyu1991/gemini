'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');

const Updater = require('lib/state-processor/capture-processor/utils/updater');
const NewScreenUpdater = require('lib/state-processor/capture-processor/screen-updater/new-screen-updater');

describe('new-screen-updater', () => {
    const sandbox = sinon.sandbox.create();

    let updater;

    beforeEach(() => {
        sandbox.stub(fs, 'accessAsync');
    });

    afterEach(() => sandbox.restore());

    const exec_ = (opts) => {
        opts = _.defaults(opts || {}, {
            refPath: '/non/relevant.png'
        });

        updater = {save: sandbox.stub()};
        sandbox.stub(Updater, 'create').returns(updater);

        return new NewScreenUpdater().exec(opts.capture, opts);
    };

    it('should save new image if it does not exists', () => {
        fs.accessAsync.returns(Promise.reject());

        return exec_({refPath: '/some/path'})
            .then(() => assert.calledWith(updater.save, '/some/path'));
    });

    it('should not save image if it already exists', () => {
        fs.accessAsync.returns(Promise.resolve());

        return exec_()
            .then(() => assert.notCalled(updater.save));
    });
});
