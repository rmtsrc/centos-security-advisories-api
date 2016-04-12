'use strict';

const AdvisoryModel = require('../models/Advisory');
const advisoryModel = new AdvisoryModel();

module.exports = {
  groupedAction: (req, res) => {
    req.params.months = parseInt(req.params.months);

    advisoryModel.getAdvisories(req.params)
      .then(data => {
        res.send(data);
      })
      .catch(error => {
        res.send(error);
      });
  },

  groupedByOsPackageAction: (req, res) => {
    req.params.months = parseInt(req.params.months);

    advisoryModel.getAdvisoriesByOsPackage(req.params)
      .then(data => {
        res.send(data);
      })
      .catch(error => {
        res.send(error);
      });
  }
};
