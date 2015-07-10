var gm = require('gm')

var size = {width: 600, height: 600};
gm('../uploads/01.jpg')
	.resize(size.width, size.height + "^")
	.gravity('Center')
	.extent(size.width, size.height)
	.write('../uploads/100.jpg', function (error) {
	      if (error) console.log('Error - ', error);
	 });
