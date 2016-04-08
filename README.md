ZenDir
======

**This is under development and may be broken at any time.**

This is designed to analyze files and directories. The main purpose is to
identify duplicate files and replace them with shortcuts (though replacement
feature is not developed yet).

Additionally, it will find near-duplicate images using pHash or blockhash
libraries, and perhaps use other methods to find near-duplicate files.

## Setup

On RHEL-like operating systems:

1. Run `sudo bash setup.sh`
2. Edit `config.py` with your setup
3. Run `python setup-db.py`
4. Run `python scan.py`

## Get more

This is in the process of being developed, and the sample data I took (which takes hours to get) did not include some important directory information. To glue that info on, do the following:

1. In mysql run `ALTER TABLE files ADD INDEX is_dupe (`is_dupe`);`
2. Run the following python scripts to setup the `directories` table and find duplicates

```bash
python buildDirs.py
python markDupes.py
python markDirDupes.py
```

Soon hopefully these will all be rolled into the main script.

## The API sucks (or doesn't exist), so here's some SQL

I started writing this in node.js, but it was not playing nice. I wrote a functional-but-ugly API in that (see another branch of this repo), but haven't yet ported it over to Python. For now I'll just drop useful SQL queries below.

```sql
/** Worst offending directories **/
SELECT
	path,
	(num_dupes / num_files) * 100 AS percent_duped,
	num_files,
	num_dupes,
	total_bytes,
	dupe_bytes
FROM directories
ORDER BY percent_duped DESC, dupe_bytes DESC

/** How many directories have only duplicate files in them? **/
SELECT
	COUNT(*)
FROM (
	SELECT
		path,
		(num_dupes / num_files) * 100 AS percent_duped,
		num_files,
		num_dupes,
		total_bytes,
		dupe_bytes
	FROM directories
	ORDER BY percent_duped DESC, dupe_bytes DESC
) AS tmp
WHERE percent_duped = 100

/** What could be eliminated **/
SELECT
	SUM(extras) AS files_we_could_eliminate,
	SUM( dupe_size ) AS bytes_we_could_eliminate
FROM (
	SELECT
		sha1,
		COUNT(*) - 1 AS extras,
		(COUNT(*) - 1) * bytes AS dupe_size
	FROM files
	WHERE is_dupe = 1
	GROUP BY sha1
) AS tmp
```
