var blockhash = require('blockhash');

// var glob = require('glob');
var path = require('path');
var fs = require('fs');

var PNG = require('png-js');
var jpeg = require('jpeg-js');



var data,
	getImgData,
	hash,
	m = 2, //higher quality hash (faster to do 1)
	bits = 16;


var filename = '/opt/meza/htdocs/wikis/topo/images/0/01/MEWS_Tab_Window.jpg';
data = new Uint8Array(fs.readFileSync(filename));

var ext = path.extname(filename);


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
}

getImgData(function(imgData) {
    hash = blockhash.blockhashData(imgData, bits, m);

    // use hamming distance to iron out little
    // differences between this jpeg decoder and the one in PIL
    // var hd = blockhash.hammingDistance(expectedHash, hash);

    console.log( hash );

    // done();
});
