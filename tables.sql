--
-- files table
--
CREATE TABLE files (
  filepath varchar(255) binary NOT NULL default '',
  filename varchar(255) binary NOT NULL default '',
  ext varchar(10) binary NOT NULL default '',
  bytes bigint NOT NULL default 0,
  sha1 varbinary(40) NOT NULL default ''
);

CREATE UNIQUE INDEX filepath ON files (filepath);
CREATE INDEX extension ON files (ext);
CREATE INDEX sha1 ON files (sha1);
