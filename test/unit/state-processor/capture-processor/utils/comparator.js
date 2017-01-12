'use strict';

const Image = require('lib/image');
const Comparator = require('lib/state-processor/capture-processor/utils/comparator');

describe('state-processor/capture-processor/utils/comparator', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    it('should have static factory creation method', () => {
        assert.instanceOf(Comparator.create(), Comparator);
    });

    describe('compareImages', () => {
        let comparator;

        beforeEach(() => {
            sandbox.stub(Image, 'compare');

            comparator = Comparator.create();
        });

        it('should pass all arguments to image comparator', () => {
            comparator.compareImages('tmp/path', 'some/ref/path', {canHaveCaret: true});

            assert.calledWith(Image.compare, 'tmp/path', 'some/ref/path', {canHaveCaret: true});
        });
    });
});
