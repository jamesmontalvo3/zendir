#!/bin/sh
#
# Dir analyzer


#
# CentOS/RHEL version 7 or 6? Get appropriate RPM.
#
# note: /etc/os-release does not exist in CentOS 6, but this works anyway
if grep -Fxq "VERSION_ID=\"7\"" /etc/os-release
then
	echo "Install MySQL for Enterprise Linux 7"
	yum -y install https://dev.mysql.com/get/mysql-community-release-el7-5.noarch.rpm
else
	echo "Install MySQL for Enterprise Linux 6"
	yum -y install https://dev.mysql.com/get/mysql-community-release-el6-5.noarch.rpm
fi


#
# Install Python, MySQL server, and Python connector
#
yum -y install \
	mysql-community-server \
	MySQL-python


#
# Start MySQL service
#
chkconfig mysqld on
service mysqld start


#
# Set root password. Must be specified
#
mysqladmin -u root password

cp ./config.example.py ./config.py

print "Setup complete. Edit config.py"
