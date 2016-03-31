var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var child_process = require('child_process');

var conf = JSON.parse( fs.readFileSync("config.json") );

var errors = [];

var connection = mysql.createConnection(conf);
connection.connect();

var sql = "SELECT rootpath, relativepath FROM files WHERE sha1 IS NULL";
var percentComplete, filepath, sha1sum, file;

var query = connection.query( sql, function(err, rows, fields) {
	if (err) {
		console.log( err );
	}

	for ( var i=0; i<rows.length; i++ ) {

		file = {
			rootpath: rows[i].rootpath,
			relativepath: rows[i].relativepath,
		};

		filepath = join( file.rootpath, file.relativepath );
		percentComplete = ((i / rows.length) * 100).toFixed(2);
		console.log( "(" + percentComplete + "%) RECORDING: " + filepath );


		try {
			fs.accessSync( filepath, fs.R_OK ) ); // throws error if can't read file
			file.sha1 = child_process.execSync('sha1sum ' + filepath).toString().slice(0,40);
			file.bytes = fs.statSync( filepath ).size;
		}
		catch (e) {
			errors.push(e);
			console.log(e);
			file.sha1 = "file access error";
			file.bytes = 0;
		}

		var query = connection.query(
			'UPDATE files SET sha1 = :sha1 WHERE rootpath = :rootpath AND relativepath = :relativepath',
			file,
			function(err, result) {
				if (err) {
					console.log( err );
					errors.push( err );
				}
			});

	}

	console.log( "(100%) RECORDING COMPLETE" );
});

connection.end();
process.exit();
