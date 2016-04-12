'use strict';

const MailmanArchiveImporter = require('../src/lib/Mailman/Archive/Importer');
const path = require('path');
const appDir = path.dirname(require.main.filename);

new MailmanArchiveImporter(appDir + '/../.cache');
