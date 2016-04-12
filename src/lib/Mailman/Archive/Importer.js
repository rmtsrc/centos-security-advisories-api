'use strict';

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const centosAdvisories = require('./Processor/centosAdvisories');
const AdvisoryModel = require('../../../models/Advisory');

module.exports = class MailmanArchiveImporter {
  /**
   * @param  {string} cacheFolder location of Mailman Archives
   * @param  {Function} optional to fire once done callback
   */
  constructor(cacheFolder, callback) {
    this.cacheFolder = cacheFolder;
    this.callback = callback;

    fs.readdir(this.cacheFolder, (err, files) => {
      let monthMailArchives = files.filter((file) => {
        return (path.extname(file) === '.gz');
      });

      let advisoryModel = new AdvisoryModel();
      return this.getAdvisoryArchivesAsJson(monthMailArchives, advisoryModel.addAdvisories.bind(this));
    });
  }

  /**
   * Reads all the advisory archives from the cacheFolder and returns them
   * as JSON to the given callback
   *
   * @param  {Array}    advisoryFiles array of a
   * @param  {Function} callback      function to call once finished
   * @param  {array}    advisories    used for recursion, array of advisories to a
   */
  getAdvisoryArchivesAsJson(advisoryFiles, callback, advisories) {
    advisories = advisories || {};
    if (!advisoryFiles.length) {
      return callback(advisories);
    }

    let archive = advisoryFiles.pop(),
        input = fs.createReadStream(`${this.cacheFolder}/${archive}`),
        messageStream = input.pipe(zlib.Gunzip()),
        buffers = [];

    messageStream.on('data', (d) => buffers.push(d));
    messageStream.on('end', () => {
      let buffer = Buffer.concat(buffers),
          monthAdvisories = centosAdvisories.getSecurityAdvisoriesFromArchiveMessages(buffer.toString());

      advisories[archive] = monthAdvisories;
      this.getAdvisoryArchivesAsJson(advisoryFiles, callback, advisories);
    });
  }
};
