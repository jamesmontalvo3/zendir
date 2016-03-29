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
  filepath varchar(255) binary NOT NULL default '',
  filename varchar(255) binary NOT NULL default '',
  ext varchar(10) binary NOT NULL default '',
  bytes bigint NOT NULL default 0,
  sha1 varbinary(40) NOT NULL default '',
  blockhash varbinary(64) NOT NULL default ''
);

CREATE UNIQUE INDEX filepath ON files (filepath);
CREATE INDEX extension ON files (ext);
CREATE INDEX sha1 ON files (sha1);
CREATE INDEX phash ON files (phash);
