'use strict';

const MailmanArchiveDownloader = require('../src/lib/Mailman/Archive/Downloader');
const path = require('path');
const appDir = path.dirname(require.main.filename);

let downloader = new MailmanArchiveDownloader(
  'https://lists.centos.org/pipermail/centos-announce/',
  appDir + '/../.cache'
);
downloader.deleteLast2Months();
downloader.getCacheArchive();
