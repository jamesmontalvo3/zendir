var fs = require('fs');
var path = require('path');
var mysql      = require('mysql');

// for blockhash
var blockhash = require('blockhash');
var PNG = require('png-js');
var jpeg = require('jpeg-js');

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

var filepaths = [];

var scanDir = function ( dirpath ) {

	var files = fs.readdirSync( dirpath );

	for( var i=0; i<files.length; i++) {

		filepath = path.join( dirpath, files[i] );
		var isFile = fs.lstatSync(filepath).isFile();

		if ( isFile ) {
			filepaths.push( filepath );
		}
		else {
			scanDir( filepath );
		}
	}

	console.log( "SCANNING " + dirpath );
};




var hashFile = function ( filepath ) {

	var percentComplete = ((nextFile / filepaths.length) * 100).toFixed(2);

	console.log( "RECORDING (" + percentComplete + "%): " + filepath );

	var crypto = require('crypto'),
		hash = crypto.createHash('sha1'),
	    stream = fs.createReadStream(filepath);

	stream.on('data', function (data) {
	    hash.update(data, 'utf8')
	});

	stream.on('end', function () {
	    phashFile( filepath, hash.digest('hex') );
	});

};

// FIXME: quick hack together...sha1 shouldn't be passed to this
var phashFile = function(filepath, sha1, bits, mode) {

	if ( ! bits ) { bits = 16; }
	if ( ! mode ) { mode = 2; } // higher quality has (for faster, do 1)

	var data,
		getImgData,
		hash,
		ext;

	data = new Uint8Array(fs.readFileSync(filepath));
	ext = path.extname(filepath);

	switch (ext) {
		case '.jpg':
		    getImgData = function(next) {
		        next(jpeg.decode(data));
		    };
		    break;

		case '.png':
		    getImgData = function(next) {
		        var png = new PNG(data);
		        var imgData = {
		            width: png.width,
		            height: png.height,
		            data: new Uint8Array(png.width * png.height * 4)
		        };

		        png.decodePixels(function(pixels) {
		            png.copyToImageData(imgData, pixels);
		            next(imgData);
		        });
		    };
		default:
			recordInDatabase( filepath, sha1, '' );
			return;
	}

	getImgData(function(imgData) {
	    phash = blockhash.blockhashData(imgData, bits, mode);

	    // use hamming distance to iron out little
	    // differences between this jpeg decoder and the one in PIL
	    // var hd = blockhash.hammingDistance(expectedHash, hash);
	    recordInDatabase( filepath, sha1, phash );
	});

};


var recordInDatabase = function ( filepath, sha1, phash ) {

	var fileInfo = path.parse( filepath );

	var file  = {
		filepath: filepath,
		filename: fileInfo.base,
		ext: fileInfo.ext.replace(/^\./, '').toLowerCase(), // trim leading period off extension
		bytes: fs.statSync( filepath ).size,
		sha1: sha1,
		phash: phash
	};

	var query = connection.query('INSERT INTO files SET ?', file, function(err, result) {
		if (err) throw err;
	});

	nextFile++;
	if ( filepaths[nextFile] ) {
		hashFile(filepaths[nextFile]);
	}
	else {
		console.log( "scan complete" );
		process.exit();
	}
};


// first real argument must be a valid path
var pathToScan = process.argv[2];
var nextFile = 0;
if ( fs.lstatSync( pathToScan ).isDirectory() ) {
	scanDir( pathToScan );
	hashFile( filepaths[nextFile] );
}