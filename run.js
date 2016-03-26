var fs = require('fs');
var path = require('path');
var mysql      = require('mysql');
var conf = JSON.parse( fs.readFileSync("config.json") );
var connection = mysql.createConnection(conf);
connection.connect();
// connection.end();


/*

File
	path
	filename
	extension
	size (bytes)
	sha1

	// later
	phash

	// even later
	created
	modified
	accessed

	// even even later
	parent directory bytes
	parent directory files
	grandparent dir bytes
	grandparent dir files

	// probably never
	parent dir like-file bytes
	parent dir like-file files

*/

var scanDir = function ( dirpath ) {

	fs.readdir( dirpath, function(err, files){

		for( var i=0; i<files.length; i++) {

			filepath = path.join( dirpath, files[i] );
			var isFile = fs.lstatSync(filepath).isFile();

			if ( isFile ) {
				hashFile( filepath );
			}
			else {
				scanDir( filepath );
			}
		}

	} );

	console.log( "SCANNING " + dirpath );
};


var hashFile = function ( filepath ) {

	var crypto = require('crypto'),
		hash = crypto.createHash('sha1'),
	    stream = fs.createReadStream(filepath);

	stream.on('data', function (data) {
	    hash.update(data, 'utf8')
	})

	stream.on('end', function () {
	    recordInDatabase( filepath, hash.digest('hex') );
	})

};


var recordInDatabase = function ( filepath, sha1 ) {

	var fileInfo = path.parse( filepath );

	var file  = {
		filepath: filepath,
		filename: fileInfo.base,
		ext: fileInfo.ext.replace(/^\./, '').toLowerCase(), // trim leading period off extension
		bytes: fs.statSync( filepath ).size,
		sha1: sha1
	};

	var query = connection.query('INSERT INTO files SET ?', file, function(err, result) {
		if (err) throw err;
	});

};


// first real argument must be a valid path
var pathToScan = process.argv[2];
if ( fs.lstatSync( pathToScan ).isDirectory() ) {
	scanDir( pathToScan );
}