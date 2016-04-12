CentOS Security Advisories API
==============================

## Introduction
A RESTful API which provides CentOS Security Advisory data in JSON format from: https://lists.centos.org/pipermail/centos-announce/

## Prerequisites
### Docker
In order to use or develop, you will need **[Docker](https://www.docker.com/)**  installed on your computer.

You can install **Docker** by [downloading/installing](https://www.docker.com/) on your computer. Or using your systems package manager e.g. `brew cask install dockertoolbox`

## Development mode
```
make dev
```
Note: this won't automatically import security advisories and will monitor code for changes.

## Running
```
make
```
Once finished, the application is automatically exposed on port `3000`, use `docker ps` to retrieve the relative port.

Security Advisories are automatically fetched and stored on startup and every 12 hours.

Tip: using [Docker nginx-proxy](https://github.com/jwilder/nginx-proxy) will expose the application at: http://centos-security-advisories-api.localhost/ (assuming this hostname is setup in your `/etc/hosts` file).

## API documentation

Once running, full API documentation can be found by navigating to the running application on port `3000` or by navigating to: http://centos-security-advisories-api.localhost/ (if you have Docker nginx-proxy running).

There are 2 primary endpoints:

### List of grouped Security Advisories

Returns a list of packages that have been identified to have security issues, grouped by `Package name`, `Criticality` and `Operating System`. Note because of this grouping security advisories sharing the same criticality will be grouped by the latest advisory.

`/grouped/within/:months-month(s)?(/:criticality)?(/os/:os)?`

### List of grouped Security Advisories by OS and Package

Returns a list of packages that have been identified to have security issues, grouped by `Operating System`, `Package name` and `Criticality`. Note because of this grouping security advisories sharing the same criticality will be grouped by the latest advisory.

`/grouped-by/os-package/within/:months-month(s)?(/:criticality)?(/os/:os)?`
