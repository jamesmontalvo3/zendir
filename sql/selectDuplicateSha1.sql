SELECT
	files.rootpath,
	files.relativepath,
	files.blockhash,
	files.sha1,
	files.bytes,
	tmp.num_duplicates
FROM files
RIGHT JOIN (
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
) AS tmp ON tmp.sha1 = files.sha1
ORDER BY tmp.num_duplicates DESC, files.sha1