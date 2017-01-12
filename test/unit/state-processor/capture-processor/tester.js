'use strict';

const Promise = require('bluebird');
const temp = require('lib/temp');
const Image = require('lib/image');
const RefChecker = require('lib/state-processor/capture-processor/utils/reference-checker');
const Comparator = require('lib/state-processor/capture-processor/utils/comparator');
const Tester = require('lib/state-processor/capture-processor/tester');

describe('state-processor/capture-processor/tester', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    it('should have static factory creation method', () => {
        assert.instanceOf(Tester.create(), Tester);
    });

    describe('exec', () => {
        let capture;
        let tester;
        let refChecker;
        let comparator;
        let imageStub;

        beforeEach(() => {
            sandbox.stub(temp, 'path').returns('tmp/path');

            refChecker = {hasAccessTo: sandbox.stub()};
            refChecker.hasAccessTo.returns(Promise.resolve);
            sandbox.stub(RefChecker, 'create').returns(refChecker);

            comparator = {compareImages: sandbox.stub()};
            comparator.compareImages.returns(true);
            sandbox.stub(Comparator, 'create').returns(comparator);

            imageStub = sinon.createStubInstance(Image);
            imageStub.save.returns(Promise.resolve());

            capture = {
                canHaveCaret: true,
                image: imageStub
            };

            tester = Tester.create('#diff');
        });

        it('should save image into temporary folder', () => {
            return tester.exec(capture, {})
                .then(() => assert.calledWith(imageStub.save, 'tmp/path'));
        });

        it('should compare images with given set of parameters', () => {
            const options = {
                refPath: 'some/ref/path',
                pixelRatio: 99,
                tolerance: 23
            };

            return tester.exec(capture, options)
                .then(() => {
                    assert.calledWith(comparator.compareImages, 'tmp/path', 'some/ref/path', {
                        canHaveCaret: true,
                        pixelRatio: 99,
                        tolerance: 23
                    });
                });
        });

        it('should return image comparison result', () => {
            return tester.exec(capture, {refPath: 'some/ref/path'})
                .then((result) => {
                    assert.deepEqual(result, {
                        currentPath: 'tmp/path',
                        referencePath: 'some/ref/path',
                        equal: true
                    });
                });
        });
    });
});
