var Img = function (fs, path, gm) {
  this._fs = fs;
  this._path = path;
  this._gm = gm;
  this._imgDir = this._path.resolve(__dirname, '../uploads/');
  this._imgSDir = this._imgDir + '/s/';
  this._imgMDir = this._imgDir + '/m/';
};

Img.prototype.rm = function (fileName) {
  this._fs.unlink(fileName, function (err) {
    if (err) console.log(err);
  });
};

Img.prototype.getImgDir = function () {
  return this._imgDir;
};

Img.prototype.getSmallImgDir = function () {
  return this._imgSDir;
};

Img.prototype.getMediumImgDir = function () {
  return this._imgMDir;
};

Img.prototype.getSmallImgDirWith = function (filename) {
  return this._imgSDir + filename;
};

Img.prototype.getMediumImgDirWith = function (filename) {
  return this._imgMDir + filename;
};

Img.prototype.convert = function (w, h, originalFile, newFile, callback) {

  this._gm(originalFile)
    .resize(w, h + "^")
    .gravity('Center')
    .noProfile()
    .extent(w, h)
    .write(newFile, function (err) {
      if (err) {
        console.log(err);
      } else {
        callback();
      };
    });
};

Img.prototype.convertAll = function (originalImg) {
  var img = this;

  var filename = img._path.basename(originalImg);

  var smallImg = img.getSmallImgDirWith(filename);
  var mediumImg = img.getMediumImgDirWith(filename);

  var rm = function () {
    img.rm(originalImg);
  };

  var convertSmall = function () {
    img.convert(400, 400, originalImg, smallImg, rm);
  };

  img.convert(700, 700, originalImg, mediumImg, convertSmall);
};

module.exports = Img;