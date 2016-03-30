#!/bin/bash
#
# Mount a server
#

if [ -f "./remote-server-config.sh" ]; then
	source "./remote-server-config.sh"
fi


# Ask for mount name
while [ -z "$mount_name" ]
do
	echo "The mount name is just a convenient identifier for the remote"
	echo "server. It can be whatever you want, but should only include"
	echo "alphanumeric characters (no spaces). "
	echo "Enter name of mount and press [ENTER]: "
	read mount_name
done

# remote share name
while [ -z "$remote_share" ]
do
	echo -e "\nEnter name of your remote share drive and press [ENTER]: "
	echo "  (Format like: //server.com/directory)"
	read remote_share
done

# Ask for remote_username
while [ -z "$remote_username" ]
do
	echo -e "\nEnter the username for the remote share and press [ENTER]: "
	read remote_username
done


# create mount
mkdir "/mnt/$mount_name"
mount.cifs "$remote_share" "/mnt/$mount_name" -o "user=$remote_username"


echo "/mnt/$mount_name created for $remote_share"

