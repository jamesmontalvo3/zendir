#!/usr/bin/env python

import os, time, MySQLdb, hashlib
from os.path import join, getsize
import config

db = MySQLdb.connect(host=config.database["host"],
					user=config.database["user"],
					passwd=config.database["passwd"],
					db=config.database["db"])
cur = db.cursor()

# top level directory to search (have to escape backslashes, f-u Windows)
# WAS: root = 'C:\\jamesbatch\\sdrive\\ConsoleLogBackup'
root = config.directoryToAnalyze
print "Performing analysis on ", root

for fullpath, dirs, files in os.walk(root):
	for name in files:

		filepath = join(fullpath, name)

		# get the file extension
		# use os.path.splitext() to split the filename on the last period
		# returns an array of two items; take the second by doing [1]
		# returned string will have the period on the front; strip it with [1:]
		# make it all lowercase
		ext = os.path.splitext(name)[1][1:].lower()

		if ext == "jpg":
			ext = "jpeg"

		size = getsize( filepath ) # size of this file

		# path to files with top level removed
		# this will make it easier to translate between S-drive files being
		# analyzed on a computer other than JSC-MOD-FS3
		relativepath = fullpath[len(root):]

		stats = os.stat( filepath )

		sha1 = hashlib.sha1()
		sha1.update( file( filepath , 'rb').read() )
		sha1 = sha1.hexdigest()

		created = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(stats.st_ctime))
		modified = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(stats.st_mtime))
		accessed = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(stats.st_atime))

		query = """
			INSERT INTO files
			(rootpath,relativepath,filename,extension,bytes,sha1,blockhash,created,modified,accessed)
			VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
			"""

		cur.execute(query,
			(name,ext,size,root,relativepath,sha1,created,modified,accessed))

	print "Complete with directory", fullpath


# Close communication with the database
cur.close()

print "complete"
