

#
# Reconnect and re-cursor so we can query from this database
#
db = MySQLdb.connect(host=config.database["host"],
					user=config.database["user"],
					passwd=config.database["passwd"],
					db=config.database["db"])
cur = db.cursor()

cur.execute("INSERT INTO files (rootpath, relativepath, filename, ext, bytes) VALUES ('/asdf','/werw/werww/thing.jpg','thing.jpg','jpeg',23525)")

cur.execute("SELECT * FROM files")

# print all the first cell of all the rows
for row in cur.fetchall():
    print row
