import config, sys

try:
	out=print getattr(config,sys.argv[1])
except:
	out=""

print out
