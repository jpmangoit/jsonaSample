const { body } = require('express-validator');


module.exports = function newsValidation() {
  return [
   body('title').notEmpty().withMessage("NewsTitleRequired"),
   body('description').notEmpty().withMessage("NewsDescriptionRequired"),
    body('file').notEmpty().withMessage("NewsImageRquired"),
  
  ]
}