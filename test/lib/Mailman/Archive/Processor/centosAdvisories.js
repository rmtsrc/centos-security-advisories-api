'use strict';

const assert = require('chai').assert;
const fs = require('fs');

const processor = require(process.cwd() + '/src/lib/Mailman/Archive/Processor/centosAdvisories');

describe('centosAdvisories', () => {
  describe('#getSecurityAdvisoriesFromArchiveMessages()', () => {
    it('will convert a CentOS Security announcement mailing list to JSON', (done) => {
        fs.readFile(process.cwd() + '/test/fixtures/centOsMessages.txt', 'utf8', (err, data) => {
          let actual = processor.getSecurityAdvisoriesFromArchiveMessages(data);

          assert.equal(actual[0].id, 'CESA-2016:0082');
          assert.equal(actual[1].id, 'CESA-2016:0083');

          assert.equal(actual[0].date, '2016-02-01T10:06:38+00:00');
          assert.equal(actual[1].date, '2016-02-01T10:07:16+00:00');

          assert.equal(actual[0].criticality, 'Important');
          assert.equal(actual[1].criticality, 'Important');

          assert.equal(actual[0].os, 'CentOS 6');
          assert.equal(actual[1].os, 'CentOS 7');

          assert.equal(actual[0].package, 'qemu-kvm');
          assert.equal(actual[1].package, 'qemu-kvm');

          assert.lengthOf(actual[0].fixedByPackages, 6);
          assert.lengthOf(actual[1].fixedByPackages, 10);

          done();
        });
      });
  });
});
