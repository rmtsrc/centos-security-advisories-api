'use strict';

const AdvisoryModel = require('../models/Advisory');

module.exports = (req, res) => {
  let advisoryModel = new AdvisoryModel();
  advisoryModel.countLastAdvisoryDate()
  .then((data) => {
    let responseJson = { status: 'OK' };
    data.map((item) => Object.assign(responseJson, item));

    res.send(responseJson);
  });
};
