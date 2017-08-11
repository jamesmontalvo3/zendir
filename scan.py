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

		print "Scanning %s" % filepath

		# get the file extension
		# use os.path.splitext() to split the filename on the last period
		# returns an array of two items; take the second by doing [1]
		# returned string will have the period on the front; strip it with [1:]
		# make it all lowercase
		extension = os.path.splitext(filename)[1][1:].lower()

		if extension == "jpg":
			extension = "jpeg"

		try:
			bytes = getsize( filepath ) # size of this file
		except:
			bytes = 0
			# FIXME: This exception handling was added due to the error:
			# "OSError: [Errno 11] Resource temporarily unavailable"
			# Perhaps have some handling for that, or consider adding a flag
			# to the line in the database for this items saying "err: bytes"
			# or something like that.

		# path to files with top level removed
		# this will make it easier to translate between S-drive files being
		# analyzed on a computer other than JSC-MOD-FS3
		relativepath = filepath[len(rootpath):]

		stats = os.stat( filepath )

		# Can't sha1 if you can't access the file
		try:
			sha1 = hashlib.sha1()
			sha1.update( file( filepath , 'rb').read() )
			sha1 = sha1.hexdigest()
		except:
			sha1 = "unable-to-generate-sha1"

		created = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(stats.st_ctime))
		modified = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(stats.st_mtime))
		accessed = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(stats.st_atime))

		query = """
			INSERT INTO files
			(rootpath,relativepath,filename,extension,bytes,sha1,created,modified,accessed)
			VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
			"""
		field_inserts = (rootpath,relativepath,filename,extension,bytes,sha1,created,modified,accessed)

		print query % field_inserts

		try:
			cur.execute(query, field_inserts)
			db.commit()
		except MySQLdb.Error, e:
			try:
				print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
			except IndexError:
				print "MySQL Error: %s" % str(e)


	print "Complete with directory", dirpath


# Close communication with the database. May be required prior to next part
cur.close()


#
# This needs to be done after the files have been scanned
#
print "generating directories..."
cur = db.cursor() # make a new one...

cur.execute("""
SELECT relativepath FROM files
""")

rows = cur.fetchall()

dirs = {}

for row in rows:
	dir = row[0][0:row[0].rfind('/')]
	if dir in dirs:
		dirs[dir] += 1
	else:
		print "NEW directory: {0}".format(dir)
		dirs[dir] = 1

print "\nCOMPLETE SCAN, START INSERT\n"

for dir in dirs:
	if dir == "":
		dir = "<root>"
	# else:
	# 	dir = MySQLdb.escape_string(dir)
	print dir
	print "INSERTING dir: {0}".format(dir)
	try:
		# query = "INSERT INTO directories (path) VALUES ({0})".format(dir)
		# print query
		cur.execute( "INSERT INTO directories (path) VALUES ( %(dir)s )", { 'dir': dir } )
		# cur.execute( query )
		db.commit()
	except MySQLdb.Error, e:
		try:
			print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
		except IndexError:
			print "MySQL Error: %s" % str(e)


# Close communication with the database
cur.close()

print "complete generating directory listings"



#
# Mark duplicates
#
cur = db.cursor() #generate a new one, just in case

print "Populate is_dupe column"

# mark all files as not duplicate
cur.execute("UPDATE files SET is_dupe=0")

# find the actual duplicates
cur.execute("""
SELECT
	sha1,
	COUNT(*) AS num_duplicates
FROM files
WHERE
	sha1 != ""
	AND sha1 IS NOT NULL
	AND bytes != 0
GROUP BY sha1
HAVING num_duplicates > 1
ORDER BY num_duplicates DESC
""")

rows = cur.fetchall()

numrows = len(rows)
for i, row in enumerate(rows):
	print "{0} of {1} Setting {2} as duplicate".format(i+1, numrows, row[0])
	try:
		cur.execute( "UPDATE files SET is_dupe=1 WHERE sha1=%(sha1)s", { 'sha1': row[0] } )
		db.commit()
	except MySQLdb.Error, e:
		try:
			print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
		except IndexError:
			print "MySQL Error: %s" % str(e)


# Close communication with the database
cur.close()

print "Complete marking duplicates"


#
# Mark directory duplicates
#
print "Mark directory info (duplicates? quantities?)"
cur = db.cursor() #again, just to be sure, recreate

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
