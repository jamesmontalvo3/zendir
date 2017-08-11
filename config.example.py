# What to scan
directoryToAnalyze = '/mnt/remoteserver/share/directory'

# Need to connect to a remote host
mountName="myshare"
remoteShare="//mysubdomain.example.com/Share"
remoteUsername="Myname"




# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                                                                 #
#                             STOP!!                              #
#                                                                 #
# Don't change the things below unless you know what you're doing #
#                                                                 #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# If using vagrant, keep user = root. Also, no reason to change anything else
# for a local VM. Really only change any of these if you insist on using an
# existing MySQL database. I highly recommend you compartmentalize this in
# Vagrant for now, though.
database = dict(
	host = 'localhost',
	db = 'zendir',
	user = 'root',
	passwd = 'password')

