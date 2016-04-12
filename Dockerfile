FROM sebflipper/node-centos:5.6

# Install cron service
RUN yum install -y anacron

ADD . /usr/src/centos-security-advisories-api
WORKDIR /usr/src/centos-security-advisories-api

EXPOSE 3000

CMD [ "provision/start.sh" ]
