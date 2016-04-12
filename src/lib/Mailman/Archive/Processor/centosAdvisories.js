'use strict';

const moment = require('moment');

module.exports = {
  /**
   * Converts a month worth of Mailman Archives into CentOS Advisories
   * @param  {string} messages raw text from Mailman
   * @return {array} CentOS security advisories
   */
  getSecurityAdvisoriesFromArchiveMessages: (messages) => {
    let advisories = [];
    messages.replace(/\n\t/g, ' ').split(/From [\w .]+:\d{2}:\d{2} \d{4}\n/).map((message) => {
      if (message) {
        let subject = message.match(/\nSubject: ([^\n]+)/)[1],
            isSecurityUpdate = (subject.search(/CESA-\d{4}:[^\s]+ (Critical|Important|Moderate|Low) CentOS (\d{1,2}) ([^\s]+)/) !== -1),
            fixedByPackages = message.match(/([^\s]+).rpm\n/g);

        if (isSecurityUpdate && fixedByPackages) {
          let advisory = {
            id: subject.match(/CESA-\d{4}:[^\s]+/)[0],
            date: moment(message.match(/\nDate: ([^\n]+)/)[1], 'ddd, D MMM YYYY HH:mm:ss Z').format(),
            criticality: subject.match(/(Critical|Important|Moderate|Low)/)[0],
            os: subject.match(/CentOS (\d{1,2})/)[0],
            package: subject.match(/CentOS \d{1,2} ([^\s]+)/)[1],
            fixedByPackages: fixedByPackages.map((pck) => pck.replace('.rpm\n', '')),
            body: message.split('\n').splice(5).join('\n').trim()
          };

          advisories.push(advisory);
        }
      }
    });

    return advisories;
  }
};
