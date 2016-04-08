#!/usr/bin/env python

import os, time, MySQLdb
from os.path import join, getsize
import config

db = MySQLdb.connect(host=config.database["host"],
					user=config.database["user"],
					passwd=config.database["passwd"],
					db=config.database["db"])
cur = db.cursor()

print "Create `directories` table..."

cur.execute("DROP TABLE IF EXISTS directories")
db.commit()

cur.execute("""
CREATE TABLE directories (
  id int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  path varchar(255) binary NOT NULL,
  num_files INT UNSIGNED,
  num_dupes INT UNSIGNED,
  total_bytes BIGINT UNSIGNED,
  dupe_bytes BIGINT UNSIGNED,
  last_scan varbinary(14)
);

CREATE UNIQUE INDEX path ON directories (path);
""")

# need to close this after generating the table for some reason
cur.close()

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
	print "INSERTING dir: {0}".format(dir)
	try:
		cur.execute( "INSERT INTO directories (path) VALUES (%s)", (dir) )
		db.commit()
	except MySQLdb.Error, e:
		try:
			print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
		except IndexError:
			print "MySQL Error: %s" % str(e)


# Close communication with the database
cur.close()

print ""
