import config, sys

try:
	if sys.argv[1] == 'password' or sys.argv[1] == 'passwd':
		out=getattr(config.database,sys.argv[1])
	else:
		out=getattr(config,sys.argv[1])
except:
	out=""

print out
