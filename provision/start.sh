#!/bin/bash

# Install dependencies
npm install

# Wait for postgres to start
while ! timeout 1 bash -c 'cat < /dev/null > /dev/tcp/postgres/5432'; do sleep 3; done

# Generate apidoc
npm run-script apidoc &

# Start and setup cron
crond

NEW_CRONTAB="0 */12 * * * sleep `shuf -i 0-719 -n 1`m; /usr/local/bin/node /usr/src/centos-security-advisories-api/scripts/cacheCentOsAnnounceArchives.js && POSTGRES_PASSWORD=$POSTGRES_PASSWORD /usr/local/bin/node /usr/src/centos-security-advisories-api/scripts/importMailmanArchive.js"
echo "$NEW_CRONTAB" | crontab -

# Import data
node scripts/cacheCentOsAnnounceArchives.js && node scripts/importMailmanArchive.js &

# Start service
npm start
