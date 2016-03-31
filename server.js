
var fs = require('fs');
var path = require('path');
var http = require('http');
var mysql = require('mysql');

var uniqueCol;

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

			var queryFile;

			var urlParts = request.url.replace(/^\//, '').replace(/\/$/, '').split("/");

			if ( urlParts[0] === "" ) {
				response.write( "<h1></h1><ul><li><a href='sha1'>sha1</a></li><li><a href='blockhash'>blockhash</a></li></ul>" );
				response.end();
				return;
			}
			else if ( urlParts[0] === "sha1" ) {
				queryFile = "selectDuplicateSha1.sql";
				uniqueCol = "sha1";
			}
			else if ( urlParts[0] === "blockhash" ) {
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

				if ( urlParts[1] === "dir" ) {
					var dir, dirs = {}, row;

					for ( var i=0; i<rows.length; i++ ) {
						row = rows[i];
						dir = row.relativepath.slice( 0, row.relativepath.lastIndexOf('/') );
						if ( ! dirs[dir] ) {
							dirs[dir] = { files: [], totalBytes: 0, dir: dir };
						}
						dirs[dir].files.push(row);
						dirs[dir].totalBytes += row.bytes;
					}
					rows = null

					var sorted = [];
					for( var d in dirs ) {
						sorted.push( dirs[d] );
					}
					sorted.sort(function(a,b) {return (a.totalBytes > b.totalBytes) ? -1 : ((b.totalBytes > a.totalBytes) ? 1 : 0);} );
					var output = "", numFiles, megabytes, relPath, uri;

					if ( urlParts[3] && parseInt( urlParts[3] ) && parseInt( urlParts[3] ) > 0 && parseInt( urlParts[3] ) < sorted.length ) {
						var limit = parseInt( urlParts[3] );
					}
					else {
						var limit = 100;
					}

					for ( var i=0; i<limit; i++ ) {
						numFiles = sorted[i].files.length;
						relPath = sorted[i].dir;
						uri = ( conf.uriPrefix + relPath ).replace(/ /g, "%20");
						megabytes = sorted[i].totalBytes/1000000;
						if ( megabytes > 1 ) {
							megabytes = megabytes.toFixed(1);
						}
						if ( urlParts[2] === "wikitext" ) {
							output += "* '''(" + numFiles + " files, " + megabytes + "MB)''' "
								+ "[" + uri + " " + relPath + "]\n";
						}
						else {
							output += "<li><strong>[" + numFiles + " files, " + megabytes + "MB]</strong> "
								+ "<a href='" + uri + "'>" + relPath + "</a><ul>";
						}

						for( var j=0; j<sorted[i].files.length; j++ ) {
							var filename = sorted[i].files[j].relativepath.slice( sorted[i].files[j].lastIndexOf('/') );
							var fileURI = ( conf.uriPrefix + sorted[i].files[j].relativepath ).replace(/ /g, "%20");
							if ( urlParts[2] === "wikitext" ) {
								output += "** [" + fileURI + " " + filename + "]\n";
							}
							else {
								output += "<li><a href='" + fileURI + "'>" + filename + "</a></li>";
							}

						}

						if ( urlParts[2] !== "wikitext" ) {
							output += "</ul></li>";
						}

					}

					if ( urlParts[2] === "wikitext" ) {
						response.writeHead(200, {'Content-Type': 'text/plain'})
						response.write( output );
						response.end();
					}
					else {
						response.writeHead(200, {'Content-Type': 'text/html'})
						response.write( "<ul>" + output + "</ul>" );
						response.end();
					}
				}
				else if ( urlParts[1] === "files" ) {

					var identicals = getIdenticals(rows);
					rows = null;
					var sorted = getSortedIdenticals(identicals);

					if ( urlParts[2] === "json" ) {
						response.writeHead(200, {'Content-Type': 'application/json'})
						response.write( JSON.stringify( sorted ) );
						response.end();
						return;
					}

					if ( urlParts[3] && parseInt( urlParts[3] ) && parseInt( urlParts[3] ) > 0 && parseInt( urlParts[3] ) < sorted.length ) {
						var limit = parseInt( urlParts[3] );
					}
					else {
						var limit = 20;
					}

					var output = "", megabytes;
					for( var i=0; i<limit; i++ ) {
						megabytes = sorted[i].totalBytes/1000000;
						if ( megabytes > 1 ) {
							megabytes = megabytes.toFixed(1);
						}
						uri = ( conf.uriPrefix + relPath ).replace(/ /g, "%20");

						if ( urlParts[2] === "wikitext" ) {
							output += "* '''" + megabytes + " MB'''<small> - " + sorted[i].files[0][uniqueCol] + "</small>\n";
						}
						else {
							output += "<li><strong>" + megabytes + " MB</strong><small> - " + sorted[i].files[0][uniqueCol] + "</small><ul>";
						}

						for ( var j=0; j<sorted[i].files.length; j++ ) {
							var relPath = sorted[i].files[j].relativepath;

							if ( urlParts[2] === "wikitext" ) {
								output += "** [" + uri + " " + relPath + "]\n";
							}
							else {
								output += "<li><a href='" + uri + "'>" + relPath + "</a></li>";
							}
						}

					}

					if ( urlParts[2] === "wikitext" ) {
						response.writeHead(200, {'Content-Type': 'text/plain'})
						response.write( output );
						response.end();
					}
					else {
						response.writeHead(200, {'Content-Type': 'text/html'})
						response.write( "<ul>" + output + "</ul>" );
						response.end();
					}

				}
				else {
					// ?
				}
			});
		});
}).listen(8080); // Activates this server, listening on port 8080.


var getIdenticals = function ( rows ) {

	var rowUnique;

	identicals = {};
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
			identicals[rowUnique] = { files: [], totalBytes: 0 };
		}

		identicals[rowUnique].files.push(fileInfo);
		identicals[rowUnique].totalBytes += row.bytes;

	}
	return identicals;

};

var getSortedIdenticals = function ( identicals ) {
	var sorted = [];
	for( var u in identicals ) {
		sorted.push( identicals[u] );
	}
	return sorted.sort(function(a,b) {return (a.totalBytes > b.totalBytes) ? -1 : ((b.totalBytes > a.totalBytes) ? 1 : 0);} );
};