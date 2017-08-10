# If using vagrant, keep user = root. Also, no reason to change anything else
# for a local VM
database = dict(
	host = 'localhost',
	db = 'zendir',
	user = 'root',
	passwd = 'password')

# What to scan
directoryToAnalyze = '/mnt/remoteserver/share/directory'

# Need to connect to a remote host
mountName="myshare"
remoteShare="//mysubdomain.example.com/Share"
remoteUsername="Myname"
