'use strict';
const NewsCategoryModel = require("../NewsCategory/NewsCategoryModel");
const NewsTagsModel = require("../NewsUsers/NewsUsersModel");
const UserModel = require("../User/UserModel");
const UserGroupsModel = require("../UserGroups/UserGroupsModel");
var bookshelf = require(__dirname + "/../../config/config").bookshelf;

let NewsModel = bookshelf.Model.extend({
  tableName: 'news',
  news_image: function () {
    return this.hasMany('NewsImageModel', 'news_id', 'id')
  },
  user: function () {
    return this.belongsTo('UserModel', 'author', 'id');
  },
  user_groups: function () {
    return this.hasMany('UserGroupsModel')
  },
  category: function () {
    return this.hasMany('NewsCategoryModel', 'id', 'category_id')
  },
  tag: function () {
    return this.hasMany('NewsTagsModel')
  },
  groups: function () {
    return this.hasMany('NewsGroupModel')
  },
  denyUser: function () {
    return this.belongsTo('UserModel', 'deny_by_id', 'id');
  },
  approvedByUser: function () {
    return this.belongsTo('UserModel', 'approved_by', 'id');
  },

})

module.exports = bookshelf.model('NewsModel', NewsModel);