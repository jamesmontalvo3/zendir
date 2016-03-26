var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

var child_process = require('child_process');

// get config from config.json
var conf = JSON.parse( fs.readFileSync("config.json") );


var sqlFile = path.join( __dirname, 'tables.sql' );

var shellCmd = 'mysql -u ' + conf.user
	+ ' -h ' + conf.host
	+ ' --password=' + conf.password
	+ ' -e"DROP DATABASE IF EXISTS ' + conf.database + ';'
	+     'CREATE DATABASE ' + conf.database + ';'
	+     'USE ' + conf.database + ';'
	+     'SOURCE ' + sqlFile + ';"';


child_process.exec( shellCmd, function(err,out){
	if (err) throw err;
	console.log(out);

	console.log("exiting...");
});
