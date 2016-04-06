import config, sys

try:
	out=getattr(config,sys.argv[1])
except:
	out=""

print out
