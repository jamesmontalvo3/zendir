SELECT
	COUNT(*),
	SUM(bytes)
FROM (
	(
		SELECT
			files.relativepath,
			files.blockhash,
			files.sha1,
			files.bytes,
			tmp.num_duplicates
		FROM files
		RIGHT JOIN (
			SELECT
				blockhash,
				COUNT(*) AS num_duplicates
			FROM files
			WHERE
				blockhash != ""
				AND blockhash != "catchable error"
				AND blockhash IS NOT NULL
			GROUP BY blockhash
			HAVING num_duplicates > 1
		) AS tmp ON tmp.blockhash = files.blockhash
	)
	UNION DISTINCT
	(
		SELECT
			files.relativepath,
			files.blockhash,
			files.sha1,
			files.bytes,
			tmp2.num_duplicates
		FROM files
		RIGHT JOIN (
			SELECT
				sha1,
				COUNT(*) AS num_duplicates
			FROM files
			WHERE
				sha1 != ""
				AND sha1 IS NOT NULL
			GROUP BY sha1
			HAVING num_duplicates > 1
		) AS tmp2 ON tmp2.sha1 = files.sha1
	)
) AS tmp3