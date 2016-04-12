'use strict';

const fs = require('fs');
const request = require('request');
const moment = require('moment');

module.exports = class MailmanArchiveDownloader {
  /**
   * @param  {string} baseArchiveUrl location of Mailman Archive page
   */
  constructor(baseArchiveUrl, cacheDir) {
    this.baseArchiveUrl = baseArchiveUrl;
    this.cacheDir = cacheDir;
  }

  /**
   * Fetches all Mailman Archives and stores in a cache folder
   */
  getCacheArchive() {
    this.fetchArchive((body) => {
      let archiveFileRegex = /href="(\d{4}-[a-zA-Z]+.txt.gz)">\[ Gzip\'d Text (\d+)/g,
          match;

      while ((match = archiveFileRegex.exec(body)) !== null) {
        let filename = match[1],
            year = /\d{4}/.exec(filename),
            month = moment().month(/-([a-zA-Z]+)/.exec(filename)[1]).format('MM'),
            path = this.cacheDir + `/${year}-${month}.txt.gz`;

        this.downloadIfNotExist(filename, path);
      }
    });
  }

  /**
   * Deletes the last 2 months (to keep up to date with security updates)
   */
  deleteLast2Months() {
    let deleteIfExists = (fileName) => {
      fs.exists(fileName, (exists) => {
        if (exists) {
          fs.unlinkSync(fileName);
        }
      });
    };

    let cacheFolder = this.cacheDir + '/',
        thisMonth = moment().format('YYYY-MM') + '.txt.gz',
        lastMonth = moment().subtract(1, 'months').format('YYYY-MM') + '.txt.gz';

    deleteIfExists(cacheFolder + thisMonth);
    deleteIfExists(cacheFolder + lastMonth);
  }

  /**
   * Download the archive listing page and fires callback when done
   * @param  {Function} callback called on success
   */
  fetchArchive(callback) {
    request(this.baseArchiveUrl, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        throw new Error({error: error, message: response});
      }
      callback(body);
    });
  }

  /**
   * Download archive if it's not already in the cache
   *
   * @param  {string} filename archive file to download
   * @param  {string} path     path to store file
   */
  downloadIfNotExist(filename, path) {
    fs.stat(path, (err, stat) => {
      if (err && err.code === 'ENOENT') {
        request(this.baseArchiveUrl + filename).pipe(fs.createWriteStream(path));
      }
    });
  }
};
