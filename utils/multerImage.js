const multer = require('multer')
const path = require('path')

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    // console.log(file)
    let ext = path.extname(file.originalname)
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg' && ext !== '.webp') {
      cb(new Error('File type is not supported'), false)
      return
    }
    cb(null, true)
  }
})