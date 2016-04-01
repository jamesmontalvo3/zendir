var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

var conf = JSON.parse( fs.readFileSync("config.json") );
var connection = mysql.createConnection(conf);
connection.connect();

var errors = [];

var scanDir = function ( dirpath ) {

	try {
		var files = fs.readdirSync( dirpath );
		console.log( "SCANNING " + dirpath );

		for( var i=0; i<files.length; i++) {

			filepath = path.join( dirpath, files[i] );
			var isFile = fs.lstatSync(filepath).isFile();

			if ( isFile ) {
				recordFilepath( filepath );
			}
			else {
				scanDir( filepath );
			}
		}

	} catch (err) {
		console.log( "SKIPPING " + dirpath + ": " + err );
	}

};


var recordFilepath = function ( filepath ) {

	var fileInfo = path.parse( filepath );

	// trim leading period off extension, lowercase, normalize name
	var ext = fileInfo.ext.replace(/^\./, '').toLowerCase();
	if ( ext === "jpg" ) {
		ext = "jpeg";
	}

	var relativepath = filepath.slice( rootpath.length );

	var file = {
		rootpath: rootpath,
		relativepath: relativepath,
		filename: fileInfo.base,
		ext: ext
	};

	var query = connection.query('INSERT IGNORE INTO files SET ?', file, function(err, result) {
		if (err) {
			console.log( err );
			errors.push( err );
		}
	});

};


// first real argument must be a valid path
var rootpath = process.argv[2];
var nextFile = 0;
if ( fs.lstatSync( rootpath ).isDirectory() ) {
	scanDir( rootpath );
	console.log( "\nSCAN COMPLETE.\nRun `node findDuplicates.js` to compute sha1 of all files." );
	process.exit();
}
