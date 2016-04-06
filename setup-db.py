#!/usr/bin/env python
#
# Setup database. Re-running this will wipe out your database!

import MySQLdb
import config

db = MySQLdb.connect(host=config.database["host"],
					user=config.database["user"],
					passwd=config.database["passwd"])

cur = db.cursor()

# Drop database, create database, use database
cur.execute("DROP DATABASE IF EXISTS %(db)s" % config.database)
cur.execute("CREATE DATABASE %(db)s" % config.database)
cur.execute("USE %(db)s" % config.database)


# PostgreSQL had:
# CREATE TABLE IF NOT EXISTS files (
# id serial PRIMARY KEY,
# filename varchar(255),
# extension varchar(255),
# bytes bigint,
# root text,
# relativepath text,
# sha1 varchar(40),
# created varchar(19),
# modified varchar(19),
# accessed varchar(19)
# );

# Other things to add maybe...
# --
# -- add even later
# --   parent directory bytes
# --   parent directory files
# --   grandparent dir bytes
# --   grandparent dir files
# --
# -- probably never
# --   parent dir like-file bytes
# --   parent dir like-file files
# --


# create table files
cur.execute("""
CREATE TABLE files (
  id int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  rootpath varchar(255) binary NOT NULL,
  relativepath varchar(255) binary NOT NULL,
  filename varchar(255) binary NOT NULL,
  ext varchar(10) binary NOT NULL default '',
  bytes bigint NOT NULL default 0,
  sha1 varbinary(40),
  blockhash varbinary(64),
  created varchar(19),
  modified varchar(19),
  accessed varchar(19)
);

CREATE UNIQUE INDEX path ON files (rootpath, relativepath);
CREATE INDEX relativepath ON files (relativepath);
CREATE INDEX extension ON files (ext);
CREATE INDEX sha1 ON files (sha1);
CREATE INDEX blockhash ON files (blockhash);
""")

db.close()

print "Database setup complete"
