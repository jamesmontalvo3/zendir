#!/usr/bin/env python

import os, time, MySQLdb
from os.path import join, getsize
import config

db = MySQLdb.connect(host=config.database["host"],
					user=config.database["user"],
					passwd=config.database["passwd"],
					db=config.database["db"])
cur = db.cursor()

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
		cur.execute( "UPDATE files SET is_dupe=1 WHERE sha1=%s", (row[0]) )
		db.commit()
	except MySQLdb.Error, e:
		try:
			print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
		except IndexError:
			print "MySQL Error: %s" % str(e)


# Close communication with the database
cur.close()

print ""
