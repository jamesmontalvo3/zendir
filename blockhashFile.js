var fs = require('fs');
var path = require('path');

// for blockhash
var blockhash = require('blockhash');
var PNG = require('png-js');
var jpeg = require('jpeg-js');

/**
 *  THIS IS NOT GUARANTEED TO WORK IN THIS VERSION
 *
 **/
var blockhashFile = function( filepath, bits, mode ) {

	if ( ! bits ) { bits = 16; }
	if ( ! mode ) { mode = 2; } // higher quality has (for faster, do 1)

	var data,
		getImgData,
		hash,
		ext;

	data = new Uint8Array(fs.readFileSync(filepath));
	ext = path.extname(filepath).toLowerCase();

	try {
		if (ext === '.png') {
			return ""; // png is failing. Skip for now. JPEG is what we mostly care about
			// png = new PNG(data);

			// imgData = {
			//	 width: png.width,
			//	 height: png.height,
			//	 data: new Uint8Array(png.width * png.height * 4)
			// };

			// png.copyToImageData(imgData, png.decodePixels(function(){}));
		}
		else if (ext === '.jpeg' || ext === '.jpg') {
			imgData = jpeg.decode(data);
		}
		else {
			return ""; // not a png or jpeg, no blockhash
		}

		if (!imgData) {
			return "Couldn't decode image";
		}

		// TODO: resize if required

		return blockhash.blockhashData(imgData, bits, mode);

	} catch (err) {
		console.log( err );
		return "catchable error";
	}

};

/** FIXME: EXPORT REQUIRED **/