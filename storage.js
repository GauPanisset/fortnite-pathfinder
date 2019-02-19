const Multer = require("multer");

const Storage = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'jsonpath');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = Multer({
  storage: Storage,
});

module.exports = {
  'Storage': Storage,
  'upload': upload
};
