'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const fs = require('fs');
const moment = require('moment');

const AdvisoryModel = require(process.cwd() + '/src/models/Advisory');

const pgPromise = require('pg-promise')();
const pgOptions = {
  host: 'postgres',
  database: 'postgres',
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgPromise(pgOptions);

describe('AdvisoryModel', () => {
  beforeEach(done => {
    db.none(`CREATE TABLE IF NOT EXISTS advisory(data JSONB)`)
      .then(db.none(`TRUNCATE advisory`))
      .then(() => {
        done();
      }).catch((error) => {
        done(error);
      });
  });

  it('will count the number of advisories and return the last know advisory', done => {
    db.none(`INSERT INTO advisory VALUES ('{"date":"2016-02-24"}')`)
    .then(() => {
      let advisoryModel = new AdvisoryModel();
      advisoryModel.countLastAdvisoryDate()
        .then((data) => {
          assert.deepEqual(data, [
            {count: '1'},
            {latestAdvisoryDate: '2016-02-24'}
          ]);

          done();
        })
        .catch((error) => {
          done(error);
        });
    });
  });

  it('will fetch advisories within the last 4 months grouped by package name, criticality and os', done => {
    let oneMonthAgo = moment().subtract(1, 'months').format('YYYY-MM-DD'),
        twoMonthsAgo = moment().subtract(2, 'months').format('YYYY-MM-DD'),
        fiveMonthsAgo = moment().subtract(5, 'months').format('YYYY-MM-DD'),
        expected1 = {
          id: 'CESA-2016:falafel',
          os: 'FalafelOS 1',
          date: oneMonthAgo,
          package: 'falafel',
          criticality: 'Critical',
          fixedByPackages: ['falafel-3']
        },
        expected2 = JSON.parse(JSON.stringify(expected1)),
        expected3 = JSON.parse(JSON.stringify(expected1)),
        notExpected1 = JSON.parse(JSON.stringify(expected1));

      expected2.date = twoMonthsAgo;
      expected2.os = 'FalafelOS 2';
      expected2.fixedByPackages[0] = 'falafel-2';

      expected3.date =  moment().subtract(1, 'days').format('YYYY-MM-DD');
      expected3.criticality = 'Minor';

      notExpected1.date = fiveMonthsAgo;
      notExpected1.fixedByPackages[0] = 'falafel-1';

      let fixture = [
        db.none(`INSERT INTO advisory VALUES ($1)`, [expected1]),
        db.none(`INSERT INTO advisory VALUES ($1)`, [expected2]),
        db.none(`INSERT INTO advisory VALUES ($1)`, [expected3]),
        db.none(`INSERT INTO advisory VALUES ($1)`, [notExpected1])
      ];

    db.task((t) => {
      return t.batch(fixture);
    })
    .then(() => {
      let advisoryModel = new AdvisoryModel();
      advisoryModel.getAdvisories({months: 4})
      .then((data) => {
        assert.deepEqual(data, [expected3, expected1, expected2]);

        done();
      })
      .catch((error) => {
        done(error);
      });
    });
  });

  it('will fetch advisories matching the given filter', done => {
    let expected1 = {
          id: 'CESA-2016:falafel',
          os: 'FalafelOS 1',
          date: moment().format('YYYY-MM-DD'),
          package: 'falafel',
          criticality: 'Critical',
          fixedByPackages: ['falafel-1']
        },
      notExpected1 = JSON.parse(JSON.stringify(expected1)),
      notExpected2 = JSON.parse(JSON.stringify(expected1));

    notExpected1.os = 'FalafelOS 2';
    notExpected1.package = 'extra-falafel';
    notExpected2.criticality = 'Important';
    notExpected2.package = 'tasty-falafel';

    let fixture = [
      db.none(`INSERT INTO advisory VALUES ($1)`, [expected1]),
      db.none(`INSERT INTO advisory VALUES ($1)`, [notExpected1]),
      db.none(`INSERT INTO advisory VALUES ($1)`, [notExpected2])
    ];

    db.task((t) => {
      return t.batch(fixture);
    })
    .then(() => {
      let advisoryModel = new AdvisoryModel();
      advisoryModel.getAdvisories({months: 4, os: 'FalafelOS 1', criticality: 'Critical'})
      .then((data) => {
        assert.deepEqual(data, [expected1]);

        done();
      })
      .catch((error) => {
        done(error);
      });
    });
  });

  it('will group group data by OS and package', done => {
    let expected1 = {
          id: 'CESA-2016:falafel',
          os: 'FalafelOS 1',
          date: moment().format('YYYY-MM-DD'),
          package: 'falafel',
          criticality: 'Critical',
          fixedByPackages: ['falafel-1']
        },
      expected2 = JSON.parse(JSON.stringify(expected1)),
      expected3 = JSON.parse(JSON.stringify(expected1)),
      expected4 = JSON.parse(JSON.stringify(expected1));

    expected2.os = 'FalafelOS 2';
    expected3.package = 'extra-falafel';
    expected4.criticality = 'Important';

    let fixture = [
      db.none(`INSERT INTO advisory VALUES ($1)`, [expected1]),
      db.none(`INSERT INTO advisory VALUES ($1)`, [expected2]),
      db.none(`INSERT INTO advisory VALUES ($1)`, [expected3]),
      db.none(`INSERT INTO advisory VALUES ($1)`, [expected4])
    ];

    db.task((t) => {
      return t.batch(fixture);
    })
    .then(() => {
      let advisoryModel = new AdvisoryModel();
      advisoryModel.getAdvisoriesByOsPackage({months: 4, os: undefined, criticality: undefined})
      .then((data) => {
        assert.deepEqual(data, [
          {
            os: 'FalafelOS 1',
            packages: {
              'extra-falafel': [expected3],
              'falafel': [expected1, expected4]
            }
          },
          {
            os: 'FalafelOS 2',
            packages: {
              'falafel': [expected2]
            }
          }
        ]);

        done();
      })
      .catch((error) => {
        done(error);
      });
    });
  });
});
