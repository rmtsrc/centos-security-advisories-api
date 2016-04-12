'use strict';

const _ = require('lodash');
const pgPromise = require('pg-promise')();

const pgOptions = {
  host: 'postgres',
  database: 'postgres',
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgPromise(pgOptions);

const table = 'advisory';

module.exports = class AdvisoryModel {
  /**
   * Counts the number of advisories and returns the last know advisory
   *
   * @return {Promise}
   */
  countLastAdvisoryDate() {
    let queries = [
      db.one(`SELECT COUNT(*) FROM ${table}`),
      db.one(`SELECT (data->>'date') AS "latestAdvisoryDate" FROM ${table}
        ORDER BY to_timestamp(data->>'date', 'YYYY-MM-DD"T"HH24:MI:SS') DESC LIMIT 1`)
    ];

    return db.task((t) => {
      return t.batch(queries);
    })
    .catch((error) => {
      console.log(error);
      pgPromise.end();
      return {
        count: '0',
        latestAdvisoryDate: null
      };
    });
  }

  /**
   * Adds an array of advisories to the database
   *
   * @param {Array}    advisories array of advisories to add
   * @param {Function} callback   optional callback to fire on success
   * @returns {Promise}
   */
  addAdvisories(advisories, callback) {
    return db.none(`CREATE TABLE IF NOT EXISTS ${table}(data JSONB)`)
    .then(db.none(`CREATE INDEX IF NOT EXISTS date_os_package_multi_column_index
      ON ${table} ((data->>'date') DESC, (data->>'os'), (data->>'package'))`))
    .then(db.none(`TRUNCATE ${table}`))
    .then(() => {
      let insert = [];
      for (let monthAdvisories in advisories) {
        advisories[monthAdvisories].map((advisory) => {
          insert.push(db.none(`INSERT INTO ${table} VALUES ($1)`, [advisory]));
        });
      }
      return insert;
    })
    .then(() => {
      pgPromise.end();
      if (typeof this.callback === 'function') {
        this.callback();
      }
    })
    .catch((error) => {
      console.log(error);
      pgPromise.end();
    });
  }

  /**
   * Get advisories by the given filters
   *
   * @param  {Object} filters key value of filters
   * @return {Array} advisories
   */
  getAdvisories(filters) {
    let filterQueryArr = [];
    if (filters.criticality) {
      filterQueryArr.push(`data->>'criticality' = $/criticality/`);
    }

    if (filters.os) {
      filterQueryArr.push(`data->>'os' = $/os/`);
    }

    let filterQuery = filterQueryArr.join(' AND ');
    if (filterQuery.length) {
      filterQuery = `AND ${filterQuery}`;
    }

    return db.any(`SELECT * FROM (
            SELECT DISTINCT ON (package, criticality, os)
            data->>'id' AS id,
            data->>'os' AS os,
            data->>'date' AS date,
            data->>'package' AS package,
            data->>'criticality' AS criticality,
            data->'fixedByPackages' AS "fixedByPackages"
            FROM ${table}
            WHERE to_date(data->>'date', 'YYYY-MM-DD') >= CURRENT_DATE - INTERVAL '$/months/ months' ${filterQuery}
            ORDER BY data->>'package', data->>'criticality', data->>'os', to_timestamp(data->>'date', 'YYYY-MM-DD"T"HH24:MI:SS') DESC
          ) data
          ORDER BY to_timestamp(date, 'YYYY-MM-DD"T"HH24:MI:SS') DESC`, filters);
  }

  /**
   * Get advisories by OS & package by the given filters
   *
   * @param  {Object} filters key value of filters
   * @return {Array} advisories
   */
  getAdvisoriesByOsPackage(filters) {
    return new Promise((resolve, reject) => {
      this.getAdvisories(filters)
        .then(data => {
          let osPackages = [];
          data.map(item => {
            let os = _.find(osPackages, os => os.os === item.os);
            if (!os) {
              let packages = {};
              packages[item.package] = [item];
              osPackages.push({os: item.os, packages: packages});
            } else {
              let packages = os.packages[item.package];
              if (!packages) {
                os.packages[item.package] = [];
              }
              os.packages[item.package].push(item);
            }
          });

          resolve(osPackages);
        });
    });
  }
};
