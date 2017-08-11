ZenDir
======

Find duplicate files. Find directories with many duplicate files. And at some point perhaps this repo will actually delete duplicates and replace with shortcuts/symlinks.

Additionally, it may at some point find near-duplicate images using pHash or blockhash libraries, and perhaps use other methods to find near-duplicate files.

## Setup

### With vagrant (recommended)

1. Install Git, VirtualBox and Vagrant
2. `git clone https://github.com/jamesmontalvo3/zendir.git`
3. `cd zendir`
4. `cp config.example.py config.py`
5. Edit `config.py` to your liking
6. `vagrant up`
7. SSH into the box with `vagrant ssh`
8. `cd /vagrant`
9. Optionally run `sudo bash mount-server.sh` to mount a server and enter password
10. Run the scan: `sudo python scan.py`. This could take a *long* time.

### On an existing RHEL-like operating systems

1. Run `sudo bash setup.sh`
2. Edit `config.py` with your setup
3. Run `python setup-db.py`
4. If you need to mount a drive to scan, run `bash mount-server.sh`
5. Run `python scan.py`

## The API sucks (or doesn't exist), so here's some SQL

I started writing this in node.js, but it was not playing nice. I wrote a functional-but-ugly API in that (see another branch of this repo), but haven't yet ported it over to Python. For now I'll just drop useful SQL queries below. If you setup with Vagrant then you can login to your VM with `vagrant up` and access the database as root with `sudo mysql` (no password entry required). Then try the following SQL commands.

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
