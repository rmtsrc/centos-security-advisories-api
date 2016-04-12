'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const fs = require('fs');

const Downloader = require(process.cwd() + '/src/lib/Mailman/Archive/Downloader');

describe('MailmanArchiveDownloader', () => {
  it('will download indvidual month mail archives and save them', (done) => {
      fs.readFile(process.cwd() + '/test/fixtures/centOsArchives.html', 'utf8', (err, data) => {
        let downloader = new Downloader('https://www.example.com');

        sinon.stub(downloader, 'downloadIfNotExist');
        sinon.stub(downloader, 'fetchArchive', (cb) => cb(data));

        downloader.getCacheArchive();

        assert(downloader.fetchArchive.calledOnce);

        assert(downloader.downloadIfNotExist.calledTwice);
        assert(downloader.downloadIfNotExist.getCall(0).calledWith('2016-February.txt.gz'));
        assert(downloader.downloadIfNotExist.getCall(1).calledWith('2016-January.txt.gz'));

        done();
      });
    });
});
