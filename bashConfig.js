var fs = require("fs");

var conf = JSON.parse( fs.readFileSync("config.json") );

var confVariable = process.argv[2];

if ( conf[ confVariable ] ) {
	console.log( conf[ confVariable ] );
}
else {
	console.log("");
}

process.exit();