const NewsCategoryModel = require("../NewsCategory/NewsCategoryModel");
const NewsUsersModel = require("../NewsUsers/NewsUsersModel");
const NewsGroupModel = require("../NewsGroup/NewsGroupModel");
const UserModel = require("../User/UserModel");
const UserGroupsModel = require("../UserGroups/UserGroupsModel");
const ApiHandler = require("../lib/ApiHandler");
let NewsModel = require(__dirname + "/NewsModel");
let NewsImageModel = require("./NewsImageModel");
let AWSHandler = require('../lib/AWSHander');
const jwt = require('jsonwebtoken');
const { isAdmin, isFunctionary, isGuestCheck, isMember_light_admin } = require("../lib/helper");
const { json } = require("body-parser");
let NewsController = {};
const { createBlobImage, generateRandomAlphaNumericString } = require('../CommonFunctions/commonFunction');

/**
* Function to get News details by Id
* @author  MangoIt Solutions
* @param  {id}
* @return {object} News details
*/
NewsController.getNewsById = async function (req, res) {
    let handler = new ApiHandler(req, res);
    let newImage;
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    try {
        //let result = await new NewsModel().where({ id: req.params.id, team_id: userInfo.attributes.vv_club_id }).fetchAll();
        let result = await new NewsModel().where({ id: req.params.id, team_id: userInfo.attributes.vv_club_id }).fetch({
            require: true,
            withRelated: ['user', 'groups.group',{'news_image': function(qb){
                qb.select('news_id','news_image')
            }}]
        });
        if (result) {
            result = result.toJSON();
            const data = {
                data: {
                    type: 'news',
                    id: req.params.id,
                    attributes: {
                        team_id: result.team_id,
                        title: result.title,
                        headline: result.headline,
                        text: result.text,
                        author: result.author,
                        priority: 1,
                        publication_date_from: result.publication_date_from,
                        publication_date_to: result.publication_date_to,
                        imageUrls: result.imageUrls,
                        attachment: result.attachment,
                        tags: result.tags,
                        audience: result.audience,
                        approved_status: result.approved_status,
                        approved_by: result.approved_by,
                        is_read: result.is_read,
                        guests: result.guests,
                        show_guest_list: result.show_guest_list,
                        updated_record: result.updated_record,
                        update_approved_status: result.update_approved_status,
                        deny_reason: result.deny_reason,
                        deny_by_id: null,
                        updated_at: result.updated_at,
                        created_at: result.created_at,
                    },
                    relationships: {
                        user: {
                            data: {
                                type: 'user',
                                id: result.author
                            }
                        }
                    }                    
                },
                included: [{
                    type: 'user',
                    id: result.user.id,
                    attributes: {
                        firstname: result.user.firstname,
                        lastname: result.user.lastname,
                    }
                }]
            };
            handler.success(data);
        }
        else {
            handler.error("somethingWentWrong");
        }
    } catch (error) {
        handler.error("somethingWentWrong");
    }
}


/**
* Function for getting Top News details by user id
* @author  MangoIt Solutions
* @param  {id} 
* @return {object} News details
*/
NewsController.getTopNews = async function (req, res) {
    let handler = new ApiHandler(req, res);
    let news;
    let newImage;
    try {
        let result = await new UserModel().where({ id: req.params.id }).orderBy('id', 'desc').fetch();
        if (isGuestCheck(req.headers.authorization)) {
            news = await new NewsModel().where({ approved_status: 1, team_id: req.user.club_id, show_guest_list: 'true' }).orderBy('created_at', 'desc').limit(5).fetchAll(
                {
                    withRelated: ['user',{'news_image': function(qb){
                        qb.select('news_id','news_image')
                    }}]
                }
            );
            news = news.toJSON();

        }
        else if (result.toJSON().role == 'member_light_admin') {
            news = await new NewsModel().where({ audience: 0, approved_status: 1, team_id: req.user.club_id, author: result.toJSON().id }).orderBy('created_at', 'desc').limit(5).fetchAll(
                {
                    withRelated: ['user',{'news_image': function(qb){
                        qb.select('news_id','news_image')
                    }}]
                }
            );
            news = news.toJSON();

        }
        else {
            let appUnNews = await new NewsModel().whereIn('audience', [0, 3]).andWhere({ team_id: req.user.club_id }).andWhere({ approved_status: 1 }).orWhere({ approved_status: 0, author: req.params.id }).orderBy('created_at', 'desc').limit(5).fetchAll(
                {
                    withRelated: ['user',{'news_image': function(qb){
                        qb.select('news_id','news_image')
                    }}]
                }
            );
            news = appUnNews.toJSON();
        }

        let arrayOfNews = [];
        let includeNews = [];
        let topNews = news;
        for (let i = 0; i < topNews.length; i++) {
           let newsInfo =  {
                type: 'news',
                id: topNews[i].id,
                attributes: {
                    team_id: topNews[i].team_id,
                    title: topNews[i].title,
                    headline: topNews[i].headline,
                    text: topNews[i].text,
                    author: topNews[i].author,
                    priority: 1,
                    publication_date_from: topNews[i].publication_date_from,
                    publication_date_to: topNews[i].publication_date_to,
                    imageUrls: topNews[i].imageUrls,
                    attachment: topNews[i].attachment,
                    tags: topNews[i].tags,
                    audience: topNews[i].audience,
                    approved_status: topNews[i].approved_status,
                    approved_by: topNews[i].approved_by,
                    is_read: topNews[i].is_read,
                    guests: topNews[i].guests,
                    show_guest_list: topNews[i].show_guest_list,
                    updated_record: topNews[i].updated_record,
                    update_approved_status: topNews[i].update_approved_status,
                    deny_reason: topNews[i].deny_reason,
                    deny_by_id: null,
                    updated_at: topNews[i].updated_at,
                    created_at: topNews[i].created_at,
                },
                relationships: {
                    user: {
                        data: {
                            type: 'user',
                            id: topNews[i].author
                        }
                    }
                }                    
            }

            let incNews = {
                type: 'user',
                id: topNews[i].user.id,
                attributes: {
                    firstname: topNews[i].user.firstname,
                    lastname: topNews[i].user.lastname,
                }
            }
            arrayOfNews.push(newsInfo)
            includeNews.push(incNews)
        }
        const data = {
            data: arrayOfNews,
            included: includeNews
        };

        res.json(data);
    } catch (error) {
        handler.error("somethingWentWrong");
    }
}



module.exports = NewsController;