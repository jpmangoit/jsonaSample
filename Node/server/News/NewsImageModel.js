'use strict';
var bookshelf = require(__dirname + "/../../config/config").bookshelf;

let NewsImageModel = bookshelf.Model.extend({
  tableName: 'news_image',

})

module.exports = bookshelf.model('NewsImageModel', NewsImageModel);