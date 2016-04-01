--
-- files table
--
-- add later
--   created
--   modified
--   accessed
--
-- add even later
--   parent directory bytes
--   parent directory files
--   grandparent dir bytes
--   grandparent dir files
--
-- probably never
--   parent dir like-file bytes
--   parent dir like-file files
--
CREATE TABLE files (
  id int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  rootpath varchar(255) binary NOT NULL,
  relativepath varchar(255) binary NOT NULL,
  filename varchar(255) binary NOT NULL,
  ext varchar(10) binary NOT NULL default '',
  bytes bigint NOT NULL default 0,
  sha1 varbinary(40),
  blockhash varbinary(64)
);

CREATE UNIQUE INDEX path ON files (rootpath, relativepath);
CREATE INDEX relativepath ON files (relativepath);
CREATE INDEX extension ON files (ext);
CREATE INDEX sha1 ON files (sha1);
CREATE INDEX blockhash ON files (blockhash);
