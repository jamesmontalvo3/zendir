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

var files;
var nextFile = 0;

var query = connection.query( sql, function(err, rows, fields) {
	if (err) {
		console.log( err );
	}

	files = rows;

	if ( files.length > 0 ) {
		doNextFile( files[0] );
	}
	else {
		console.log( "No rows returned." );
		process.exit();
	}

});

var doNextFile = function () {

	var file = files[nextFile];
	nextFile++;

	filepath = path.join( file.rootpath, file.relativepath );
	percentComplete = ((nextFile / files.length) * 100).toFixed(2);
	console.log( "(" + percentComplete + "%) RECORDING: " + filepath );

	var crypto = require('crypto'),
		hash = crypto.createHash('sha1'),
		stream = fs.createReadStream(filepath);

	stream.on('data', function (data) {
		hash.update(data, 'utf8')
	});

	stream.on('error', function (err) {
		console.log( err );
		errors.push( err );
		file.sha1 = "skipped-stream-error";
		recordInDatabase( filepath, file );
	});

	stream.on('end', function () {
		file.sha1 = hash.digest('hex');
		recordInDatabase( filepath, file );
	});

};

var recordInDatabase = function( filepath, file ) {

	//var sql = 'UPDATE files SET sha1 = :sha1 WHERE rootpath = :rootpath AND relativepath = :relativepath';
	var sha1 = mysql.escape(file.sha1),
		rootpath = mysql.escape(file.rootpath),
		relativepath = mysql.escape(file.relativepath);
	var sql = 'UPDATE files SET sha1 = '+sha1+' WHERE rootpath = '+rootpath+' AND relativepath = '+relativepath;

	var query = connection.query(
		sql,
		file,
		function(err, result) {
			if (err) {
				console.log( err );
				errors.push( err );
			}
		}
	);

	if ( files[nextFile] ) {
		doNextFile();
	}
	else {
		console.log( "(100%) RECORDING COMPLETE" );
		connection.end();
		process.exit();
	}

};

