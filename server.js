
var fs = require('fs');
var path = require('path');
var http = require('http');
var mysql = require('mysql');



http.createServer(function(request, response) {
	var headers = request.headers;
	var method = request.method;
	var url = request.url;
	var body = [];
	request
		.on('error', function(err) {
			console.error(err);
		})
		.on('data', function(chunk) {
			body.push(chunk);
		})
		.on('end', function() {
			body = Buffer.concat(body).toString();

			var conf = JSON.parse( fs.readFileSync("config.json") );
			var connection = mysql.createConnection(conf);
			connection.connect();

			var queryFile, uniqueCol;

			// rows like: {
			// 	rootpath: rootpath,
			// 	relativepath: relativepath,
			// 	filename: fileInfo.base,
			// 	ext: ext,
			// 	bytes: fs.statSync( filepath ).size,
			// 	sha1: sha1,
			// 	blockhash: blockhashFile( filepath )
			// };


			if ( request.url === "" ) {
				response.write( "<h1></h1><ul><li><a href='sha1'>sha1</a></li><li><a href='blockhash'>blockhash</a></li></ul>" );
				response.end();
				return;
			}
			else if ( request.url === "/sha1" ) {
				queryFile = "selectDuplicateSha1.sql";
				uniqueCol = "sha1";
			}
			else if ( request.url === "/blockhash" ) {
				queryFile = "selectDuplicateBlockhash.sql";
				uniqueCol = "blockhash";
			}
			else {
				response.write( "BAD REQUEST: " + request.url );
				response.end();
				return;
			}


			var sql = fs
				.readFileSync(
					path.join( __dirname, "sql", queryFile ),
					{ encoding: "utf8" }
				)
				.replace(/\n/g, " ");


			var query = connection.query( sql, function(err, rows, fields) {
				if (err) {
					console.log( err );
				}

				var rowUnique, row;

				var identicals = {};
				for ( var i=0; i<rows.length; i++ ) {

					row = rows[i];
					rowUnique = row[uniqueCol].toString();

					fileInfo = {
						rootpath: row.rootpath,
						relativepath: row.relativepath,
						ext: row.ext,
						bytes: row.bytes
					};
					fileInfo[uniqueCol] = rowUnique;

					if ( ! identicals[rowUnique] ) {
						identicals[rowUnique] = { files: [], bytes: 0 };
					}

					identicals[rowUnique].files.push(fileInfo);
					identicals[rowUnique].bytes += row.bytes;

				}

				var sorted = [];
				for( var u in identicals ) {
					sorted.push( identicals[u] );
				}
				sorted.sort(function(a,b) {return (a.bytes > b.bytes) ? 1 : ((b.bytes > a.bytes) ? -1 : 0);} );

				response.write( JSON.stringify( sorted ) );
				response.end();

			});
		});
}).listen(8080); // Activates this server, listening on port 8080.
