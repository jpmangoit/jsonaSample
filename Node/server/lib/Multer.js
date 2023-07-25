const multer = require('multer');


// Multer Storage to save uploaded Files from XLS and CSV
var storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null, __dirname + '../../../uploads')
    },
    filename: async function(req,file,cb){
        cb(null,file.originalname);
    }
})
var uploadMW = multer({storage:storage});

module.exports = uploadMW;