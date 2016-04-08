#!/usr/bin/env python

import os, time, MySQLdb
from os.path import join, getsize
import config

db = MySQLdb.connect(host=config.database["host"],
					user=config.database["user"],
					passwd=config.database["passwd"],
					db=config.database["db"])
cur = db.cursor()

cur.execute("SELECT path FROM directories")

dirs = cur.fetchall()
numDirs = len(dirs)

for i,dir in enumerate(dirs):
	dirpath = dir[0]
	print "{0} of {1} RECORDING {2}".format(i, numDirs, dirpath)
	cur.execute("""
			SELECT
				COUNT(*), SUM(is_dupe), SUM(bytes), SUM( IF(is_dupe,bytes,0) )
			FROM files
			WHERE
				relativepath LIKE "{0}%"
		""".format( db.escape_string(dirpath) ) )

	numFiles = cur.fetchone()

	cur.execute( "UPDATE directories SET num_files=%s, num_dupes=%s, total_bytes=%s, dupe_bytes=%s WHERE path=%s",
			(numFiles[0], numFiles[1], numFiles[2], numFiles[3], dirpath) )
	db.commit()

print "File quantities per directory are populated"
