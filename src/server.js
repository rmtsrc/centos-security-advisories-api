'use strict';

const express = require('express');
const cors = require('cors');
const listController = require('./controllers/list');

let app = express();

app.use(cors({
  origin: '*',
  methods: 'GET'
}));

app.use('/', express.static('apidoc'));

/**
 * @api {get} /grouped/within/:months-month(s)?(/:criticality)?(/os/:os)? List of grouped Security Advisories
 * @apiVersion 0.0.1
 * @apiName ListGrouped
 * @apiGroup SecurityAdvisories
 * @apiDescription Returns a list of packages that have been identified to have
 * security issues, grouped by `Package name`, `Criticality` and `Operating System`.
 * Note because of this grouping security advisories sharing the same
 * criticality will be grouped by the latest advisory.
 * @apiExample {curl} Example use cases:
 *     curl "/grouped/within/6-months"
 *     curl "/grouped/within/6-months/Critical"
 *     curl "/grouped/within/6-months/os/CentOS 7"
 *     curl "/grouped/within/6-months/Critical/os/CentOS 7"
 *
 * @apiParam {Number} months Number of months to show
 * @apiParam {String="Critical","Important","Moderate","Low"} [criticality] Filter by criticality
 * @apiParam {String="CentOS {Number}"} [os] Operating System version to filter by
 *
 * @apiSuccess {String} id Security Advisory ID
 * @apiSuccess {String} os Operating System version
 * @apiSuccess {Date} date Date advisory issued
 * @apiSuccess {String} package Affected package name
 * @apiSuccess {String} criticality Advisory criticality
 * @apiSuccess {Array} fixedByPackages Array of packages that fix the security issue
 *
 * @apiSampleRequest /grouped/within/:months-months/:criticality/os/:os
 * @apiSuccessExample {json} Example Success Response:
 * 	HTTP/1.1 200 OK
 * 	[{
 * 	   "id": "CESA-2016:0189",
 * 	   "os": "CentOS 7",
 * 	   "date": "2016-02-17T01:41:36+00:00",
 * 	   "package": "polkit",
 * 	   "criticality": "Moderate",
 * 	   "fixedByPackages": ["polkit-0.112-6.el7_2.i686",
 * 	     "polkit-0.112-6.el7_2.x86_64", "polkit-devel-0.112-6.el7_2.i686",
 * 	     "polkit-devel-0.112-6.el7_2.x86_64", "polkit-docs-0.112-6.el7_2.noarch",
 * 	     "polkit-0.112-6.el7_2.src"
 * 	   ]
 * 	 }, {
 * 	   "id": "CESA-2016:0176",
 * 	   "os": "CentOS 7",
 * 	   "date": "2016-02-17T01:37:20+00:00",
 * 	   "package": "glibc",
 * 	   "criticality": "Critical",
 * 	   "fixedByPackages": ["glibc-2.17-106.el7_2.4.i686",
 * 	     "glibc-2.17-106.el7_2.4.x86_64", "glibc-common-2.17-106.el7_2.4.x86_64",
 * 	     "glibc-devel-2.17-106.el7_2.4.i686",
 * 	     "glibc-devel-2.17-106.el7_2.4.x86_64",
 * 	     "glibc-headers-2.17-106.el7_2.4.x86_64",
 * 	     "glibc-static-2.17-106.el7_2.4.i686",
 * 	     "glibc-static-2.17-106.el7_2.4.x86_64",
 * 	     "glibc-utils-2.17-106.el7_2.4.x86_64", "nscd-2.17-106.el7_2.4.x86_64",
 * 	     "glibc-2.17-106.el7_2.4.src"
 * 	   ]
 * 	 }]
 */
app.get('/grouped/within/:months-month(s)?(/:criticality)?(/os/:os)?', listController.groupedAction);

/**
 * @api {get} /grouped-by/os-package/within/:months-month(s)?(/:criticality)?(/os/:os)? List of grouped Security Advisories by OS and Package
 * @apiVersion 0.0.1
 * @apiName GroupedByOsPackage
 * @apiGroup SecurityAdvisories
 * @apiDescription Returns a list of packages that have been identified to have
 * security issues, grouped by `Operating System`, `Package name` and `Criticality`.
 * Note because of this grouping security advisories sharing the same
 * criticality will be grouped by the latest advisory.
 * @apiExample {curl} Example use cases:
 *     curl "/grouped-by/os-package/within/6-months"
 *     curl "/grouped-by/os-package/within/6-months/Critical"
 *     curl "/grouped-by/os-package/within/6-months/os/CentOS 7"
 *     curl "/grouped-by/os-package/within/6-months/Critical/os/CentOS 7"
 *
 * @apiParam {Number} months Number of months to show
 * @apiParam {String="Critical","Important","Moderate","Low"} [criticality] Filter by criticality
 * @apiParam {String="CentOS {Number}"} [os] Operating System version to filter by
 *
 * @apiSuccess {String} id Security Advisory ID
 * @apiSuccess {String} os Operating System version
 * @apiSuccess {Date} date Date advisory issued
 * @apiSuccess {String} package Affected package name
 * @apiSuccess {String} criticality Advisory criticality
 * @apiSuccess {Array} fixedByPackages Array of packages that fix the security issue
 *
 * @apiSampleRequest /grouped-by/os-package/within/:months-months/:criticality/os/:os
 * @apiSuccessExample {json} Example Success Response:
 *  HTTP/1.1 200 OK
 *  [{
 *   "os": "CentOS 7",
 *   "packages": {
 *     "polkit": [{
 *       "id": "CESA-2016:0189",
 *       "os": "CentOS 7",
 *       "date": "2016-02-17T01:41:36+00:00",
 *       "package": "polkit",
 *       "criticality": "Moderate",
 *       "fixedByPackages": ["polkit-0.112-6.el7_2.i686",
 *         "polkit-0.112-6.el7_2.x86_64",
 *         "polkit-devel-0.112-6.el7_2.i686",
 *         "polkit-devel-0.112-6.el7_2.x86_64",
 *         "polkit-docs-0.112-6.el7_2.noarch",
 *         "polkit-0.112-6.el7_2.src"
 *       ]
 *     }],
 *     "glibc": [{
 *       "id": "CESA-2016:0176",
 *       "os": "CentOS 7",
 *       "date": "2016-02-17T01:37:20+00:00",
 *       "package": "glibc",
 *       "criticality": "Critical",
 *       "fixedByPackages": ["glibc-2.17-106.el7_2.4.i686",
 *         "glibc-2.17-106.el7_2.4.x86_64",
 *         "glibc-common-2.17-106.el7_2.4.x86_64",
 *         "glibc-devel-2.17-106.el7_2.4.i686",
 *         "glibc-devel-2.17-106.el7_2.4.x86_64",
 *         "glibc-headers-2.17-106.el7_2.4.x86_64",
 *         "glibc-static-2.17-106.el7_2.4.i686",
 *         "glibc-static-2.17-106.el7_2.4.x86_64",
 *         "glibc-utils-2.17-106.el7_2.4.x86_64",
 *         "nscd-2.17-106.el7_2.4.x86_64",
 *         "glibc-2.17-106.el7_2.4.src"
 *       ]
 *     }]
 *   }
 * }]
 *
 */
app.get('/grouped-by/os-package/within/:months-month(s)?(/:criticality)?(/os/:os)?', listController.groupedByOsPackageAction);

/**
 * @api {get} /status System Status
 * @apiVersion 0.0.1
 * @apiName SystemStatus
 * @apiGroup System
 * @apiDescription Returns current system status
 *
 * @apiSuccess {String} status Was the request successful
 * @apiSuccess {String} count Number of advisories in the system
 * @apiSuccess {Date} latestAdvisoryDate The date of the latest advisory in the system
 *
 * @apiSampleRequest /status
 * @apiSuccessExample {json} Example Success Response:
 *   HTTP/1.1 200 OK
 *   {
 *     "status": "OK",
 *     "count": "1234",
 *     "latestAdvisoryDate": "2016-02-01T10:06:38+00:00"
 *   }
 */
app.get('/status', require('./controllers/status'));

let server = app.listen(3000, () => {
  let host = server.address().address,
      port = server.address().port;

  console.log('centos-security-advisories-api app listening at http://%s:%s', host, port);
});
