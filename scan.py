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
# WAS: rootpath = 'C:\\jamesbatch\\sdrive\\ConsoleLogBackup'
rootpath = config.directoryToAnalyze
print "Performing analysis on ", rootpath

for dirpath, dirs, files in os.walk(rootpath):
	for filename in files:

		filepath = join(dirpath, filename)

		print "Scanning %(filepath)s"

		# get the file extension
		# use os.path.splitext() to split the filename on the last period
		# returns an array of two items; take the second by doing [1]
		# returned string will have the period on the front; strip it with [1:]
		# make it all lowercase
		extension = os.path.splitext(filename)[1][1:].lower()

		if extension == "jpg":
			extension = "jpeg"

		bytes = getsize( filepath ) # size of this file

		# path to files with top level removed
		# this will make it easier to translate between S-drive files being
		# analyzed on a computer other than JSC-MOD-FS3
		relativepath = filepath[len(rootpath):]

		stats = os.stat( filepath )

		# FIXME: CHECK PERMISSIONS BEFORE ATTEMPTING TO READ
		sha1 = hashlib.sha1()
		sha1.update( file( filepath , 'rb').read() )
		sha1 = sha1.hexdigest()

		created = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(stats.st_ctime))
		modified = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(stats.st_mtime))
		accessed = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(stats.st_atime))

		query = """
			INSERT INTO files
			(rootpath,relativepath,filename,extension,bytes,sha1,created,modified,accessed)
			VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
			"""

		try:
			cur.execute(query, (rootpath,relativepath,filename,extension,bytes,sha1,created,modified,accessed))
		except MySQLdb.Error, e:
			try:
				print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
			except IndexError:
				print "MySQL Error: %s" % str(e)


	print "Complete with directory", dirpath


# Close communication with the database
cur.close()

print "complete"
