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
ORDER BY tmp.num_duplicates DESC, files.blockhash