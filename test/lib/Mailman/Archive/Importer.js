'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const fs = require('fs');

const Importer = require(process.cwd() + '/src/lib/Mailman/Archive/Importer');

const pgOptions = {
  host: 'postgres',
  database: 'postgres',
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
};

describe('MailmanArchiveImporter', () => {
  it('will import the cached archives into the database', (done) => {
    new Importer(process.cwd() + '/test/fixtures/', () => {
      const pgPromise = require('pg-promise')();
      const db = pgPromise(pgOptions);

      db.one('SELECT COUNT(*) FROM advisory')
      .then((result) => {
        assert.equal(2, result.count);
        return db.one('SELECT json_agg(data) FROM advisory');
      })
      .then((result) => {
        assert.equal(result.json_agg[0].id, 'CESA-2016:0082');
        assert.equal(result.json_agg[1].id, 'CESA-2016:0083');
      })
      .then(done)
      .catch((error) => {
        done(error);
      });
    });
  });
});
