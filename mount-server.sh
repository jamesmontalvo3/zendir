#!/bin/bash
#
# Mount a server
#

mountName=`node bashConfig.js mountName`
remoteShare=`node bashConfig.js remoteShare`
remoteUsername=`node bashConfig.js remoteUsername`

# Ask for mount name
while [ -z "$mountName" ]
do
	echo "The mount name is just a convenient identifier for the remote"
	echo "server. It can be whatever you want, but should only include"
	echo "alphanumeric characters (no spaces). "
	echo "Enter name of mount and press [ENTER]: "
	read mountName
done

# remote share name
while [ -z "$remoteShare" ]
do
	echo -e "\nEnter name of your remote share drive and press [ENTER]: "
	echo "  (Format like: //server.com/directory)"
	read remoteShare
done

# Ask for remoteUsername
while [ -z "$remoteUsername" ]
do
	echo -e "\nEnter the username for the remote share and press [ENTER]: "
	read remoteUsername
done


# create mount
mkdir "/mnt/$mountName"
mount.cifs "$remoteShare" "/mnt/$mountName" -o "user=$remoteUsername"


echo "/mnt/$mountName created for $remoteShare"

