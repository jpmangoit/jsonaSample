const ApiHandler = require("../lib/ApiHandler");
let GroupsModel = require("../Groups/GroupsModel");
const UserModel = require("../User/UserModel");
const RoomModel = require("../Rooms/RoomModel");
const InstructorModel = require("../Instructor/InstructrModel");
const FaqModel = require("../Faq/FaqModel");
const FaqCategoryModel = require("../FaqCategory/FaqCategoryModel");
const SurveyModel = require("../Survey/SurveyModel");
const EventModel = require("../Events/EventsModel");
const NewsModel = require("../News/NewsModel");
const GroupParticipantsModel = require("../UserGroups/UserGroupsModel");
const EventUsersModel = require("../EventUsers/EventUsersModel");
const CoursesModel = require("../Courses/CoursesModel");
const CourseUsersModel = require("../CourseUsers/CourseUserModel");
const CourseInternalInstructorModel = require("../CourseInternalInstructor/CourseInternalInstructorModel");
const TasksModel = require("../Tasks/TasksModel");
const TaskCollaboratorsModel = require("../TaskCollaborators/TaskCollaboratorsModel");
const MessageModel = require("../Message/MessageModel")
let CommonApiController = {};
const jwt = require('jsonwebtoken');

/**
* Function to  get all groups details and user details for a specific team_id
* @author  MangoIt Solutions
* @param  {team_id}
* @return {object} group details
*/
CommonApiController.getTeamGroupsAndUsers = async function (req, res) {
    let handler = new ApiHandler(req, res);
    try {
        let result = await new GroupsModel().where({ team_id: req.params.team_id, approved_status: 1 }).withCount('participants').withCount('newsGroup').orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'team': function (qb) {
                },
                'participants': function (qb) {
                },
                'newsGroup.news': function (qb) {
                }
            }]
        });

        let result1 = await new UserModel().where(qb => {
            qb.whereNotIn("role", ['member_light', 'member_light_admin'])
            qb.where({ team_id: req.params.team_id })
        }).orderBy('id', 'desc').fetchAll({
            withRelated: ['team']
        });

        let room  = await new RoomModel().where({ team_id: req.params.team_id, approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: ['room_availablity']
        });

        handler.success({ users: result1.toJSON(), groups: result.toJSON(), rooms: room.toJSON() });
    }
    catch (error) {
        handler.error("somethingWentWrong");
    }
}


/**
* Function to  get all groups details and user details for a specific team_id
* @author  MangoIt Solutions
* @param  {team_id}
* @return {object} group details
*/
CommonApiController.getCourseCommonInfo = async function (req, res) {
    let handler = new ApiHandler(req, res);
    try {
        let users = await new UserModel().where(qb => {
            qb.whereNotIn("role", ['member_light', 'member_light_admin'])
            qb.where({ team_id: req.params.team_id })
        }).orderBy('id', 'desc').fetchAll({
            withRelated: ['team']
        });

        let group = await new GroupsModel().where({ team_id: req.params.team_id, approved_status: 1 }).withCount('participants').withCount('newsGroup').orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'team': function (qb) {
                },
                'participants': function (qb) {
                },
                'newsGroup.news': function (qb) {
                }
            }]
        });

        let room  = await new RoomModel().where({ team_id: req.params.team_id, approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: ['room_availablity']
        });

        let instructor = await new InstructorModel().where({ team_id: req.params.team_id, approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: ['qualification', 'availablity']
        });

        handler.success({ users: users.toJSON(), groups: group.toJSON(), rooms: room.toJSON(), instructors: instructor.toJSON() });
    }
    catch (error) {
        handler.error("somethingWentWrong");
    }
}



/**
* Function to  get Number of post, number of approved events and task by user ,number of message count
* @author  MangoIt Solutions
* @param  {user_id}
* @return {object} group details
*/
CommonApiController.getNumberOfPostEventsMessage = async function (req, res) {
    let handler = new ApiHandler(req, res);
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    try {
        var date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        let posts = await new NewsModel().where({ team_id: userInfo.attributes.vv_club_id, audience: 0 }).andWhere("created_at", '>=', date).fetchAll();
        posts = posts.toJSON().length;

        let result = await new UserModel().where({ id: req.params.user_id }).orderBy('id', 'desc').fetch({
            withRelated: ['event_user.events']
        });
        let events = await new EventModel().where({ audience: 0, approved_status: 1, team_id: userInfo.attributes.vv_club_id }).fetchAll();
        events = events.toJSON();
        let arrayOfNews = [];
        if (result) {
            result = result.toJSON();
            await result && result.event_user && result.event_user.forEach(event => {
                if (event.approved_status == 1 && event.team_id == userInfo.attributes.vv_club_id) {
                    if (Object.keys(event.events).length != 0) {
                        arrayOfNews.push(event.events);
                    }
                }
            })
        }
        let result1 = await new UserModel().where({ id: req.params.user_id }).orderBy('id', 'desc').fetchAll({
            columns: ['id', 'username'],
            withRelated: [
                {
                    'userta.taskss': function (qb) {
                        qb.where({ status: 0 })
                    },
                },
                'userta.taskss.subtasks'
            ]
        });
        let arrayOfTasks = [];
        if (result1) {
            result1 = result1.toJSON();
            result1 = result1[0];
            result1 && result1.userta && result1.userta.forEach(gr => {
                if (gr.approved_status != 0) {  // only approved status
                    gr.taskss.forEach(taskss => {
                        if (taskss.status == 0) {
                            arrayOfTasks.push(taskss);
                        }
                    });
                }
            });
        }

        let eventCount = arrayOfNews.length + arrayOfTasks.length;

        let k_id = userInfo.sub;
        let messageCount = await new MessageModel().where(qb => {
            qb.where({ owner: k_id })
            qb.where('type', '=', 'inbox');
            qb.where({ is_read: 0 })
            qb.where({ receiver_id: k_id })
        }).count('*');

        handler.success({ posts: posts, events: eventCount, message: messageCount });
    }
    catch (error) {
        handler.error("somethingWentWrong");
    }
}


//Notification API for Admin
/**
* Function to get all unapproved room details and all unapproved updated room details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} room details
*/
CommonApiController.getUnapprovedAndUnapprovedUpdatedRooms = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let unapproved_room;
    let unapprovedAdminRoom = [];

    try {
        await new RoomModel()
            .where({ approved_status: 0, team_id: userInfo.attributes.vv_club_id ,  deny_by_id: null})
            .fetchAll({
                withRelated: ['user']
            })
            .then(room => {
                unapproved_room = room.toJSON();
            }).catch(error => {
                handler.error("somethingWentWrong");
            })

        unapproved_room.forEach(element => {
            if (element.user && Object.keys(element.user).length > 0) {
                unapprovedAdminRoom.push({
                    'id': element.id,
                    'firstName': element.user.firstname,
                    'lastName': element.user.lastname,
                    'title': element.name,
                    'notificationType': 'roomNotifications',
                    'created_at': element.created_at
                })
            }
        });

        let updatedRoom = await new RoomModel().where({ team_id: userInfo.attributes.vv_club_id }).whereNotNull('updated_record').orderBy('id', 'desc').fetchAll({
            withRelated: ['user']
        });
        updatedRoom.toJSON().forEach(element => {
            if (element.user && Object.keys(element.user).length > 0) {
                unapprovedAdminRoom.push({
                    'id': element.id,
                    'firstName': element.user.firstname,
                    'lastName': element.user.lastname,
                    'title': element.name,
                    'notificationType': 'roomUpdateNotifications',
                    'created_at': element.updated_at,
                })
            }
        })
        handler.success(unapprovedAdminRoom);
    }
    catch (error) {
        handler.error("somethingWentWrong");
    }
}


/**
* Function to get all unapproved Instructor details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Instructor details
*/
CommonApiController.unapprovedAdminInstructor = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let unapproved_instructor;
    let InstructorNotifications = [];
    try {
        await new InstructorModel()
            .where({ team_id: userInfo.attributes.vv_club_id, approved_status: 0, deny_by_id: null })
            .fetchAll({
                withRelated: ['user']
            })
            .then(instructor => {
                unapproved_instructor = instructor.toJSON();
            }).catch(error => {
                handler.error("somethingWentWrong");
            })
        unapproved_instructor.forEach(element => {
            if (element.user && Object.keys(element.user).length > 0 ) {
                InstructorNotifications.push({
                    'id': element.id,
                    'firstName': element.user.firstname,
                    'lastName': element.user.lastname,
                    'title': element.emaill,
                    'notificationType': 'instructorNotifications',
                    'created_at': element.created_at
                })
            }
        })

        let updated_instructor = await new InstructorModel().where({ team_id: userInfo.attributes.vv_club_id }).whereNotNull('updated_record').orderBy('id', 'desc').fetchAll({
            withRelated: ['instructorAuthor']
        });

        updated_instructor.toJSON().forEach(element => {
            if (element.instructorAuthor && Object.keys(element.instructorAuthor).length > 0) {
                InstructorNotifications.push({
                    'id': element.id,
                    'firstName': element.instructorAuthor.firstname,
                    'lastName': element.instructorAuthor.lastname,
                    'title': element.emaill,
                    'notificationType': 'updateInstructorNotifications',
                    'created_at': element.updated_at,
                })
            }
        })

        handler.success(InstructorNotifications);
    }
    catch (error) {
        handler.error("somethingWentWrong");
    }
}


/**
* Function to get all unapproved Faq details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Faq details
*/
CommonApiController.getUnapprovedFaqNotification = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let FaqNotification = [];
    let unapproved_faq;
    try {
        unapproved_faq = await new FaqModel().where({ team_id: userInfo.attributes.vv_club_id, approved_status: 0, deny_by_id: null }).fetchAll({
            withRelated: ['user']
        });

        unapproved_faq.toJSON().forEach(element => {
            if(element.user && Object.keys(element.user).length > 0){
            FaqNotification.push({
                'id': element.id,
                'firstName': element.user.firstname,
                'lastName': element.user.lastname,
                'title': element.title,
                'notificationType': 'faqsNotifications',
                'created_at': element.createdAt,
            })
        }
        })

        let result = await new FaqCategoryModel().where({ team_id: userInfo.attributes.vv_club_id, approved_status: 0 }).fetchAll({
            withRelated: ['user']
        })
        result.toJSON().forEach(element => {
            if(element.user && Object.keys(element.user).length > 0){
            FaqNotification.push({
                'id': element.id,
                'firstName': element.user.firstname,
                'lastName': element.user.lastname,
                'title': element.category_title,
                'notificationType': 'faqsCategoryNotifications',
                'created_at': element.createdAt,
            })
        }
        })

        let faqUpdate = await new FaqModel().where({ team_id: userInfo.attributes.vv_club_id , deny_by_id: null  }).whereNotNull('updated_record').orderBy('id', 'desc').fetchAll({
            withRelated: ['user']
        });


        faqUpdate.toJSON().forEach(element => {
            if(element.user && Object.keys(element.user).length > 0){
            FaqNotification.push({
                'id': element.id,
                'firstName': element.user.firstname,
                'lastName': element.user.lastname,
                'title': element.title,
                'notificationType': 'updateFaqsNotificationToadmin',
                'created_at': element.modifiedAt,
            })
        }
        })
        handler.success(FaqNotification);

    } catch (error) {
        handler.error(error);
    }
}




/**
* Function to get all unapproved Survey Notification, unapporved updated survey Notification details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Survey details
*/
CommonApiController.getUnapprovedSurveyNotification = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let SurveyNotification = [];

    try {
        let unapproved_survey = await new SurveyModel().where({ team_id: userInfo.attributes.vv_club_id, approved_status: 0 , deny_by_id: null  }).fetchAll({
            withRelated: ['user_name']
        });
        unapproved_survey.toJSON().forEach(element => {
            if(element.user_name && Object.keys(element.user_name).length > 0){
            SurveyNotification.push({
                'id': element.id,
                'firstName': element.user_name.firstname,
                'lastName': element.user_name.lastname,
                'title': element.title,
                'notificationType': 'surveyNotifications',
                'created_at': element.created_at,
            })
        }
        })

        let unapprovedUpdatedSurvey = await new SurveyModel().where({ team_id: userInfo.attributes.vv_club_id }).whereNotNull('updated_record').orderBy('id', 'desc').fetchAll({
            withRelated: ['user_name']
        });
        unapprovedUpdatedSurvey.toJSON().forEach(element => {
           if(element.user_name && Object.keys(element.user_name).length > 0){
            SurveyNotification.push({
                'id': element.id,
                'firstName': element.user_name.firstname,
                'lastName': element.user_name.lastname,
                'title': element.title,
                'notificationType': 'updateSurveyNotification',
                'created_at': element.updated_at,
            })
       }
        })

        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll()
        let unapprovedsurvey_user = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetch({
            withRelated: [{
                'survey_user.surveys.user_name': function (qb) {
                    qb.select('id', 'firstname', 'lastname');
                }
            }]
        });
        let arrayOfSurvey = [];
        let arrayofSurv = [];
        if (unapprovedsurvey_user) {
            unapprovedsurvey_user = unapprovedsurvey_user.toJSON();
            await unapprovedsurvey_user && unapprovedsurvey_user.survey_user && unapprovedsurvey_user.survey_user.forEach(e => {
                if (e.surveys.approved_status == 1 && e.read_status == 0 && (e.surveys.team_id == userInfo.attributes.vv_club_id)) {
                    if (e.approvedStatus == 0) {
                        arrayOfSurvey.push(e.surveys);
                    }
                }
            })
        }
        arrayofSurv = arrayOfSurvey.reverse();
        arrayofSurv.forEach(element => {
            if(element.user_name && Object.keys(element.user_name).length > 0){
            SurveyNotification.push({
                'id': element.id,
                'firstName': element.user_name.firstname,
                'lastName': element.user_name.lastname,
                'title': element.title,
                'notificationType': 'invitedSurveyNotifications',
                'created_at': element.updated_at,
            })
        }
        })
        handler.success(SurveyNotification);
    } catch (error) {
        handler.error(error);
    }
}


/**
* Function to get all unapproved Event Notification, unapporved updated Event Notification details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Event details
*/
CommonApiController.getUnapprovedEventNotification = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let EventNotification = [];

    try {
        let unapproved_event = await new EventModel()
            .where({ approved_status: 0, team_id: userInfo.attributes.vv_club_id, deny_by_id: null })
            .fetchAll({
                withRelated: ['user']
            })

        unapproved_event.toJSON().forEach(element => {
            if(element.user && Object.keys(element.user).length > 0){
            EventNotification.push({
                'id': element.id,
                'firstName': element.user.firstname,
                'lastName': element.user.lastname,
                'title': element.name,
                'notificationType': 'eventsNotifications',
                'created_at': element.created_at,
            })
        }
        })

        let updated_event = await new EventModel().where({ team_id: userInfo.attributes.vv_club_id }).whereNotNull('updated_record').orderBy('id', 'desc').fetchAll({
            withRelated: ['user']
        });

        updated_event.toJSON().forEach(element => {
            if(element.user && Object.keys(element.user).length > 0){
            EventNotification.push({
                'id': element.id,
                'firstName': element.user.firstname,
                'lastName': element.user.lastname,
                'title': element.name,
                'notificationType': 'eventUpdateNotifications',
                'created_at': element.created_at,
            })
        }
        })

        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll()
        let result = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetch({
          withRelated: ['event_user.events.author']
         
        });

        let arrayOfEvent = [];
        if (result) {
            result = result.toJSON();
            await result && result.event_user && result.event_user.forEach(event => {
                if (event.approved_status == 0 && event.events.team_id == userInfo.attributes.vv_club_id && event.events.approved_status == 1) {
                    arrayOfEvent.unshift(event.events);
                }
            })
        }
        arrayOfEvent.forEach(async element => {
            if(element.author && Object.keys(element.author).length > 0){
            EventNotification.push({
                'id': element.id,
                'firstName': element.author.firstname,
                'lastName': element.author.lastname,
                'title': element.name,
                'notificationType': 'invitedEventsNotifications',
                'created_at': element.created_at,
            })
        }
        })

        let updateNoti = await new EventUsersModel()
            .where({ approved_status: 1, event_updated_status: 1, user_id: user_id.toJSON()[0].id })
            .fetchAll({
                withRelated: ['users',
                    'events.author']
            });

        updateNoti.toJSON().forEach(async element => {
            if (Object.keys(element.events).length > 0 && Object.keys(element.events.author).length > 0 && (element.events.team_id == userInfo.attributes.vv_club_id )) {
                EventNotification.push({
                    'id': element.event_id,
                    'firstName': element.events.author.firstname,
                    'lastName': element.events.author.lastname,
                    'title': element.events.name,
                    'notificationType': 'updatedEventNotificationForExistingUsers',
                    'created_at': element.events.created_at,
                })
            }
        })
        handler.success(EventNotification);
    } catch (error) {
        handler.error(error);
    }

}


/**
* Function to get all unapproved News Notification, unapporved updated News Notification details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} News details
*/
CommonApiController.getUnapprovedNewsNotification = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let NewsNotification = [];

    try {
        let unapproved_news = await new NewsModel().where({ team_id: userInfo.attributes.vv_club_id, approved_status: 0, deny_by_id: null }).orderBy('id', 'desc').fetchAll({
            withRelated: ['user']
        });
        unapproved_news.toJSON().forEach(element => {
            if(element.user && Object.keys(element.user).length > 0){
            NewsNotification.push({
                'id': element.id,
                'firstName': element.user.firstname,
                'lastName': element.user.lastname,
                'title': element.title,
                'notificationType': 'newsNotifications',
                'created_at': element.created_at,
            })
        }
        })

        let updated_news = await new NewsModel().where({ team_id: userInfo.attributes.vv_club_id, deny_by_id: null }).whereNotNull('updated_record').orderBy('id', 'desc').fetchAll({
            withRelated: ['user']
        });
        updated_news.toJSON().forEach(element => {
            if(element.user && Object.keys(element.user).length > 0){
            NewsNotification.push({
                'id': element.id,
                'firstName': element.user.firstname,
                'lastName': element.user.lastname,
                'title': element.title,
                'notificationType': 'updateNewsNotifications',
                'created_at': element.updated_at,
            })
        }
        })
        handler.success(NewsNotification);
    } catch (error) {
        handler.error(error);
    }
}


/**
* Function to get all unapproved Group Notification, unapporved updated Group Notification details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Group details
*/
CommonApiController.getUnapprovedGroupNotification = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let GroupNotification = [];
    try {
        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll({ columns: ['id', 'email'] })
        let unapproved_group = await new GroupParticipantsModel()
            .where({ approved_status: 2 })
            .fetchAll({
                withRelated: ['user', 'group']
            });

        unapproved_group.toJSON().forEach(element => {
            if (element && Object.keys(element.group).length > 0 && element.group.created_by == user_id.toJSON()[0].id && Object.keys(element.user).length > 0) {
                GroupNotification.push({
                    'id': element.group_id,
                    'firstName': element.user.firstname,
                    'lastName': element.user.lastname,
                    'title': element.group.name,
                    'notificationType': 'groupNotifications',
                    'created_at': element.group.created_at,
                    'userId': element.user_id
                })
            }
        })

        let unapporvedUserGroup = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetchAll({
            columns: ['id', 'username'],
            withRelated: [
                'usergr.groups.createdby',
            ]
        });
        let arrayOfGroups = [];
        if (unapporvedUserGroup) {
            unapporvedUserGroup = unapporvedUserGroup.toJSON();
            unapporvedUserGroup = unapporvedUserGroup[0];
            unapporvedUserGroup && unapporvedUserGroup.usergr && unapporvedUserGroup.usergr.forEach(gr => {
                if (gr.approved_status == 0) {
                    gr.groups.forEach(groups => {
                        if (groups.approved_status) {
                            arrayOfGroups.push(groups);
                        }
                    });
                }
            });
        }
        arrayOfGroups.forEach(element => {
           if(element.createdby && Object.keys(element.createdby).length > 0){
            GroupNotification.push({
                'id': element.id,
                'firstName': element.createdby.firstname,
                'lastName': element.createdby.lastname,
                'title': element.name,
                'notificationType': 'unapprovedUserGroups',
                'created_at': element.created_at,
            })
        }
        })

        let group_approval = await new GroupsModel().where({ team_id: userInfo.attributes.vv_club_id, approved_status: 0, deny_by_id: null }).fetchAll({
            withRelated: ['createdby']
        });
        group_approval.toJSON().forEach(element => {
           if(element.createdby && Object.keys(element.createdby).length > 0){
            GroupNotification.push({
                'id': element.id,
                'firstName': element.createdby.firstname,
                'lastName': element.createdby.lastname,
                'title': element.name,
                'notificationType': 'groupForApprovals',
                'created_at': element.created_at,
            })
        }
        })

        let updated_groups = await new GroupsModel().where({ team_id: userInfo.attributes.vv_club_id , deny_by_id: null }).whereNotNull('updated_record').orderBy('id', 'desc').fetchAll({
            withRelated: ['createdby']
        });

        updated_groups.toJSON().forEach(element => {
            if( element.createdby && Object.keys( element.createdby).length > 0){
            GroupNotification.push({
                'id': element.id,
                'firstName': element.createdby.firstname,
                'lastName': element.createdby.lastname,
                'title': element.name,
                'notificationType': 'updateGroupNotifications',
                'created_at': element.updated_at,
            })
        }
        })

        let GroupNotificationUser = await new GroupParticipantsModel()
            .where({ approved_status: 1, group_updated_status: 1, user_id: user_id.toJSON()[0].id })
            .fetchAll({
                withRelated: [{
                    'group': function (qb) {
                        qb.where({ approved_status: 1 })
                    }
                }, 'group.createdby']
            });
        GroupNotificationUser.toJSON().forEach(element => {
            if(element.group && Object.keys(element.group).length > 0 &&  element.group.createdby && Object.keys( element.group.createdby).length > 0  && (element.group.team_id == userInfo.attributes.vv_club_id) ){
            GroupNotification.push({
                'id': element.group_id,
                'firstName': element.group.createdby.firstname,
                'lastName': element.group.createdby.lastname,
                'title': element.group.name,
                'notificationType': 'updatedGroupNotificationForExistingUsers',
                'created_at': element.updated_at,
            })
        }
        })
        handler.success(GroupNotification);
    }
    catch (error) {
        handler.error(error);
    }
}


/**
* Function to get all unapproved Course Notification, unapporved updated course Notification details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Course details
*/
CommonApiController.getUnapprovedCourseNotification = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let CourseNotification = [];

    try {
        let unapproved_course = await new CoursesModel()
            .where({ approved_status: 0, team_id: userInfo.attributes.vv_club_id }).whereNull('deny_reason')
            .fetchAll({
                withRelated: ['author']
            })

        unapproved_course.toJSON().forEach(element => {
            if(element.author && Object.keys(element.author).length > 0){
            CourseNotification.push({
                'id': element.id,
                'firstName': element.author.firstname,
                'lastName': element.author.lastname,
                'title': element.name,
                'notificationType': 'coursesNotifications',
                'created_at': element.created_at,
            })
        }
        })

        let updated_course = await new CoursesModel().where({ team_id: userInfo.attributes.vv_club_id }).whereNotNull('updated_record').orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'user': function (qb) {
                    qb.select('id', 'username', 'firstname', 'lastname');
                }
            }]
        });

        updated_course.toJSON().forEach(element => {
            if(element.user && Object.keys(element.user).length > 0){
            CourseNotification.push({
                'id': element.id,
                'firstName': element.user.firstname,
                'lastName': element.user.lastname,
                'title': element.name,
                'notificationType': 'updateCourseNotifications',
                'created_at': element.updated_at,
            })
        }
        })

        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll({ columns: ['id', 'email'] })
        let unapproveCourse_user = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetch({
            withRelated: ['course_user.courses.author']
        });

        let arrayOfCours = [];
        if (unapproveCourse_user) {
            unapproveCourse_user = unapproveCourse_user.toJSON();
            await unapproveCourse_user && unapproveCourse_user.course_user.forEach(course => {
                if (course.approved_status == 0 && course.courses.approved_status == 1 ) {
                    arrayOfCours.push(course);
                }
            })
        }
        arrayOfCours.forEach(async element => {
            if (Object.keys(element.courses).length > 0 && (element.courses.team_id == userInfo.attributes.vv_club_id)) {
                CourseNotification.push({
                    'id': element.courses.id,
                    'firstName': element.courses.author.firstname,
                    'lastName': element.courses.author.lastname,
                    'title': element.courses.name,
                    'notificationType': 'invitedCoursesNotifications',
                    'created_at': element.courses.created_at,
                })
            }
        })

        let update_noti_exuser = await new CourseUsersModel()
            .where({ approved_status: 1, course_updated_status: 1, user_id: user_id.toJSON()[0].id })
            .fetchAll({
                withRelated: ['courses.author']
            });
        update_noti_exuser.toJSON().forEach(element => {
            if (element.courses && Object.keys(element.courses).length > 0 && element.courses.author && Object.keys(element.courses.author).length > 0  && (element.courses.team_id == userInfo.attributes.vv_club_id)) {
                CourseNotification.push({
                    'id': element.course_id,
                    'firstName': element.courses.author.firstname,
                    'lastName': element.courses.author.lastname,
                    'title': element.courses.name,
                    'notificationType': 'updatedCourseNotificationForExistingUsers',
                    'created_at': element.courses.created_at,
                })
            }
        })

        let internalInstructorNoti = await new CourseInternalInstructorModel()
            .where({ user_id: user_id.toJSON()[0].id, is_read: 1, course_update_status: 0 })
            .fetchAll({
                withRelated: [{
                    'course': function (qb) {
                        qb.where({ approved_status: 1 })
                    }
                }, {
                    'course.author': function (qb) {
                        qb.select('id', 'username', 'firstname', 'lastname');
                    }
                }]
            });

        internalInstructorNoti.toJSON().forEach(async element => {
            if (element.course && Object.keys(element.course).length > 0 && element.course.author && Object.keys(element.course.author).length > 0  && (element.course.team_id == userInfo.attributes.vv_club_id)) {
                CourseNotification.push({
                    'id': element.course_id,
                    'firstName': element.course.author.firstname,
                    'lastName': element.course.author.lastname,
                    'title': element.course.name,
                    'notificationType': 'internalCourseInstructorNotifications',
                    'created_at': element.course.created_at,
                })
            }
        })

        let internalInstructor_courseupdate = await new CourseInternalInstructorModel()
            .where({ user_id: user_id.toJSON()[0].id, is_read: 1, course_update_status: 1 })
            .fetchAll({
                withRelated: [{
                    'course': function (qb) {
                        qb.where({ approved_status: 1 })
                    }
                }, {
                    'course.author': function (qb) {
                        qb.select('id', 'username', 'firstname', 'lastname');
                    }
                }]
            });
        internalInstructor_courseupdate.toJSON().forEach(element => {
            if (element.course && Object.keys(element.course).length > 0 && element.course.author && Object.keys(element.course.author).length > 0 && (element.course.team_id == userInfo.attributes.vv_club_id)) {
                CourseNotification.push({
                    'id': element.course_id,
                    'firstName': element.course.author.firstname,
                    'lastName': element.course.author.lastname,
                    'title': element.course.name,
                    'notificationType': 'internalUpdateCourseInstructorNotifications',
                    'created_at': element.course.created_at,
                })
            }
        })

        let userWantToJoinCourse = await new CourseUsersModel()
            .where({ approved_status: 2 })
            .fetchAll({
                withRelated: ['users', {
                    'courses': function (qb) {
                        qb.select('id', 'name', 'picture_video', 'created_at', 'updated_at'),
                            qb.where({ author: user_id.toJSON()[0].id })
                    }
                }]
            });

        userWantToJoinCourse.toJSON().forEach(element => {
            if (element.users && Object.keys(element.users).length > 0 && element.courses &&  Object.keys(element.courses).length > 0 && (element.courses.team_id == userInfo.attributes.vv_club_id)) {
                CourseNotification.push({
                    'id': element.course_id,
                    'firstName': element.users.firstname,
                    'lastName': element.users.lastname,
                    'title': element.courses.name,
                    'notificationType': 'userWantsToJoinCourseNotificationToCreator',
                    'created_at': element.courses.created_at,
                    'userIId': element.user_id
                })
            }
        })
        handler.success(CourseNotification);
    }
    catch (error) {
        handler.error(error);
    }
}



/**
* Function to get all unapproved Task Notification, unapporved updated Task Notification details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Task details
*/
CommonApiController.getUnapprovedTaskNotification = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let TaskNotification = [];
    try {
        let unapproved_task = await new TasksModel().where({ team_id: userInfo.attributes.vv_club_id, status: 2, deny_by_id: null })
            .fetchAll({
                withRelated: ['userstask']
            });

        unapproved_task.toJSON().forEach(element => {
            TaskNotification.push({
                'id': element.id,
                'firstName': element.userstask.firstname,
                'lastName': element.userstask.lastname,
                'title': element.title,
                'notificationType': 'taskNotifications',
                'created_at': element.created_at,
            })
        })

        let unapprovedUpdated_task = await new TasksModel().where({ team_id: userInfo.attributes.vv_club_id }).whereNotNull('updated_record').orderBy('id', 'desc').fetchAll({
            withRelated: ['userstask']
        });

        unapprovedUpdated_task.toJSON().forEach(element => {
            TaskNotification.push({
                'id': element.id,
                'firstName': element.userstask.firstname,
                'lastName': element.userstask.lastname,
                'title': element.title,
                'notificationType': 'updateTasksNotifications',
                'created_at': element.updated_at,
            })
        })

        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll({ columns: ['id', 'email'] })
        let user_unapproveTask = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetchAll({
            columns: ['id', 'username', 'firstname', 'lastname'],
            withRelated: [
                'userta.taskss.subtasks',
                {
                    'userta.taskss.userstask': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }
            ]
        });
        let arrayOfTasks = [];
        if (user_unapproveTask) {
            user_unapproveTask = user_unapproveTask.toJSON();
            user_unapproveTask = user_unapproveTask[0];
            user_unapproveTask && user_unapproveTask.userta && user_unapproveTask.userta.forEach(gr => {
                if (gr.approved_status == 1 && gr.read_status != 1) {  // only approved status
                    gr.taskss.forEach(taskss => {
                        if (taskss.status != 2 && (taskss.team_id == userInfo.attributes.vv_club_id)) {
                            arrayOfTasks.push(taskss);
                        }
                    });
                }
            });
        }
        arrayOfTasks.forEach(element => {
            TaskNotification.push({
                'id': element.id,
                'firstName': element.userstask.firstname,
                'lastName': element.userstask.lastname,
                'title': element.title,
                'notificationType': 'unapprovedTasks',
                'created_at': element.created_at,
            })
        })

        let user_unapproveSubTask = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetchAll({
            columns: ['id', 'username'],
            withRelated: [
                'usersubta.subtasks.tasks', {
                    'usersubta.subtasks.tasks.userstask': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }
            ]
        });
        let arrayOfsubTasks = [];
        if (user_unapproveSubTask) {
            user_unapproveSubTask = user_unapproveSubTask.toJSON();
            user_unapproveSubTask = user_unapproveSubTask[0];
            user_unapproveSubTask && user_unapproveSubTask.usersubta && user_unapproveSubTask.usersubta.forEach(gr => {
                if (gr.approved_status == 1 && gr.read_status != 1) {  // only approved status
                    gr.subtasks.forEach(taskss => {
                        if (taskss.tasks.status != 2 && (taskss.tasks.team_id == userInfo.attributes.vv_club_id)) {
                            arrayOfsubTasks.push(taskss);
                        }
                    });
                }
            });
        }
        arrayOfsubTasks.forEach(element => {
            TaskNotification.push({
                'id': element.id,
                'firstName': element.tasks.userstask.firstname,
                'lastName': element.tasks.userstask.lastname,
                'title': element.title,
                'notificationType': 'unapprovedSubTask',
                'created_at': element.tasks.created_at,
                "task_id": element.task_id
            })
        })

        let updateTask_existingUser = await new TaskCollaboratorsModel()
            .where({ approved_status: 1, task_updated_status: 1, user_id: user_id.toJSON()[0].id })
            .fetchAll({
                withRelated: ['user',
                    'taskss.group',
                    {
                        'taskss.userstask': function (qb) {
                            qb.select('id', 'firstname', 'lastname')
                        }
                    }]
            });
        updateTask_existingUser.toJSON().forEach(element => {
            if (Object.keys(element.taskss).length > 0  && (element.taskss.team_id == userInfo.attributes.vv_club_id)) {
                TaskNotification.push({
                    'id': element.taskss[0].id,
                    'firstName': element.taskss[0].userstask.firstname,
                    'lastName': element.taskss[0].userstask.lastname,
                    'title': element.taskss[0].title,
                    'notificationType': 'updatedTaskNotificationForExistingUsers',
                    'created_at': element.taskss[0].created_at,
                })
            }
        })
        handler.success(TaskNotification);
    }
    catch (error) {
        handler.error(error);
    }
}



/**
* Function to get all deny news, publish request approved,update news request approve Notification details for user 
* @author  MangoIt Solutions
* @param  {} 
* @return {object} News details
*/
CommonApiController.getNewsNotificationForUser = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let UserNewsNotification = [];
    try {
        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll({ columns: ['id', 'email'] })
        let deny_news = await new NewsModel().where({ author: user_id.toJSON()[0].id , team_id : userInfo.attributes.vv_club_id }).whereNotNull('deny_reason').orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'denyUser': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });

        deny_news.toJSON().forEach(element => {
            if (element && element.denyUser && Object.keys(element.denyUser).length > 0) {
                UserNewsNotification.push({
                    'id': element.id,
                    'firstName': element.denyUser.firstname,
                    'lastName': element.denyUser.lastname,
                    'title': element.title,
                    'notificationType': 'denyNewsNotifications',
                    'created_at': element.updated_at,
                })
            }
        })

        let approved_news = await new NewsModel()
            .where({ author: user_id.toJSON()[0].id,team_id : userInfo.attributes.vv_club_id, approved_status: 1, is_read: 1 })
            .fetchAll({
                withRelated: [{
                    'approvedByUser': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }]
            });

        approved_news.toJSON().forEach(element => {
            if (element && element.approvedByUser && Object.keys(element.approvedByUser).length > 0) {
                UserNewsNotification.push({
                    'id': element.id,
                    'firstName': element.approvedByUser.firstname,
                    'lastName': element.approvedByUser.lastname,
                    'title': element.title,
                    'notificationType': 'approvedPublishNewsNotificationToCreator',
                    'created_at': element.updated_at,
                })
            }
        })

        let approved_updated_news = await new NewsModel().where({ author: user_id.toJSON()[0].id, team_id : userInfo.attributes.vv_club_id , update_approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'approvedByUser': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });
        approved_updated_news.toJSON().forEach(element => {
            if (element && element.approvedByUser && Object.keys(element.approvedByUser).length > 0) {
                UserNewsNotification.push({
                    'id': element.id,
                    'firstName': element.approvedByUser.firstname,
                    'lastName': element.approvedByUser.lastname,
                    'title': element.title,
                    'notificationType': 'approvedUpdateNewsNotificationToCreator',
                    'created_at': element.updated_at,
                })
            }
        })

        handler.success(UserNewsNotification);
    }
    catch (error) {
        handler.error(error);
    }
}



/**
* Function to get all unapproved Faq details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Faq details
*/
CommonApiController.getFaqNotificationForUser = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let UserFaqNotification = [];
    try {
        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll({ columns: ['id', 'email'] })
        let approved_faq = await new FaqModel().where({ author: user_id.toJSON()[0].id, team_id : userInfo.attributes.vv_club_id , approved_status: 1, is_read: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'approvedBy': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });

        approved_faq.toJSON().forEach(element => {
            if (element.approvedBy && Object.keys(element.approvedBy).length > 0) {
            UserFaqNotification.push({
                'id': element.id,
                'firstName': element.approvedBy.firstname,
                'lastName': element.approvedBy.lastname,
                'title': element.title,
                'notificationType': 'approvedFaqNotification',
                'created_at': element.modifiedAt,
            })
        }
        })

        let approved_updated_faq = await new FaqModel().where({ author: user_id.toJSON()[0].id , team_id : userInfo.attributes.vv_club_id , update_approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'approvedBy': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });
        approved_updated_faq.toJSON().forEach(element => {
            if (element.approvedBy && Object.keys(element.approvedBy).length > 0) {
            UserFaqNotification.push({
                'id': element.id,
                'firstName': element.approvedBy.firstname,
                'lastName': element.approvedBy.lastname,
                'title': element.title,
                'notificationType': 'updateFaqsNotificationToAuthor',
                'created_at': element.modifiedAt,
            })
        }
        })

        let deny_faq = await new FaqModel().where({ author: user_id.toJSON()[0].id , team_id : userInfo.attributes.vv_club_id }).whereNotNull('deny_reason').orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'denyBy': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });
        deny_faq.toJSON().forEach(element => {
            if (element.denyBy && Object.keys(element.denyBy).length > 0) {
                UserFaqNotification.push({
                    'id': element.id,
                    'firstName': element.denyBy.firstname,
                    'lastName': element.denyBy.lastname,
                    'title': element.title,
                    'notificationType': 'faqsDenyNotificationToAuthor',
                    'created_at': element.modifiedAt,
                })
            }
        })
        handler.success(UserFaqNotification);
    }
    catch (error) {
        handler.error(error);
    }
}


/**
* Function to get rrom notifications for user
* @author  MangoIt Solutions
* @param  {} 
* @return {object} room details
*/
CommonApiController.getRoomsNotificationForUser = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let unapproved_room;
    let UserRoomNotification = [];
    try {
        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll({ columns: ['id', 'email'] })

        let deny_room = await new RoomModel().where({ author: user_id.toJSON()[0].id , team_id : userInfo.attributes.vv_club_id }).whereNotNull('deny_reason').orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'user': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }, {
                'denybyuser': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });
        deny_room.toJSON().forEach(element => {
            if (element.denybyuser && Object.keys(element.denybyuser).length > 0) {
                UserRoomNotification.push({
                    'id': element.id,
                    'firstName': element.denybyuser.firstname,
                    'lastName': element.denybyuser.lastname,
                    'title': element.name,
                    'notificationType': 'denyRoomNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        });

        let approve_room = await new RoomModel()
            .where({ author: user_id.toJSON()[0].id, team_id : userInfo.attributes.vv_club_id, approved_status: 1, is_read: 1 })
            .fetchAll({
                withRelated: [{
                    'approvebyuser': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }]
            });

        approve_room.toJSON().forEach(element => {
            if (element.approvebyuser && Object.keys(element.approvebyuser).length > 0) {
                UserRoomNotification.push({
                    'id': element.id,
                    'firstName': element.approvebyuser.firstname,
                    'lastName': element.approvebyuser.lastname,
                    'title': element.name,
                    'notificationType': 'approvedRoomNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        });

        let approve_updated_room = await new RoomModel().where({ author: user_id.toJSON()[0].id,team_id : userInfo.attributes.vv_club_id, update_approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'approvebyuser': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });
        approve_updated_room.toJSON().forEach(element => {
            if (element.approvebyuser && Object.keys(element.approvebyuser).length > 0) {
                UserRoomNotification.push({
                    'id': element.id,
                    'firstName': element.approvebyuser.firstname,
                    'lastName': element.approvebyuser.lastname,
                    'title': element.name,
                    'notificationType': 'approvedUpdateRoomNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        });
        handler.success(UserRoomNotification);
    }
    catch (error) {
        handler.error(error);
    }
}

/**
* Function to get all unapproved publish Event Notification, approved updated Event Notification, deny Event details
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Event details
*/
CommonApiController.getEventNotificationForUser = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let UserEventNotification = [];
    try {
        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll();
        let approved_event = await new EventModel().where({ author: user_id.toJSON()[0].id , team_id : userInfo.attributes.vv_club_id, approved_status: 1, is_read: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'approvedBy': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });
        approved_event.toJSON().forEach(element => {
            if (element.approvedBy && Object.keys(element.approvedBy).length > 0) {
                UserEventNotification.push({
                    'id': element.id,
                    'firstName': element.approvedBy.firstname,
                    'lastName': element.approvedBy.lastname,
                    'title': element.name,
                    'notificationType': 'approvedEventNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        });

        let deny_event = await new EventModel().where({ author: user_id.toJSON()[0].id ,team_id : userInfo.attributes.vv_club_id }).whereNotNull('deny_reason').orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'denybyuser': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });
        deny_event.toJSON().forEach(element => {
            if (element.denybyuser && Object.keys(element.denybyuser).length > 0) {
                UserEventNotification.push({
                    'id': element.id,
                    'firstName': element.denybyuser.firstname,
                    'lastName': element.denybyuser.lastname,
                    'title': element.name,
                    'notificationType': 'denyEventNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        });

        let approved_update_event = await new EventModel().where({ author: user_id.toJSON()[0].id , team_id : userInfo.attributes.vv_club_id, update_approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'approvedBy': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });

        approved_update_event.toJSON().forEach(element => {
            if (element.approvedBy && Object.keys(element.approvedBy).length > 0) {
                UserEventNotification.push({
                    'id': element.id,
                    'firstName': element.approvedBy.firstname,
                    'lastName': element.approvedBy.lastname,
                    'title': element.name,
                    'notificationType': 'approvedUpdateEventNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        });

        let updateNoti = await new EventUsersModel()
            .where({ approved_status: 1, event_updated_status: 1, user_id: user_id.toJSON()[0].id })
            .fetchAll({
                withRelated: ['users',
                    'events.author']
            });

        updateNoti.toJSON().forEach(async element => {
            if (element.events && Object.keys(element.events).length > 0 && Object.keys(element.events.author).length > 0 && (element.events.team_id == userInfo.attributes.vv_club_id)) {
                UserEventNotification.push({
                    'id': element.event_id,
                    'firstName': element.events.author.firstname,
                    'lastName': element.events.author.lastname,
                    'title': element.events.name,
                    'notificationType': 'updatedEventNotificationForExistingUsers',
                    'created_at': element.events.updated_at,
                })
            }
        })

        let result = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetch({
            withRelated: ['event_user.events.author']
        });

        let arrayOfEvent = [];
        if (result) {
            result = result.toJSON();
            await result && result.event_user && result.event_user.forEach(event => {
                if (event.approved_status == 0 && event.events.team_id == userInfo.attributes.vv_club_id && event.events.approved_status == 1) {
                    arrayOfEvent.unshift(event.events);
                }
            })
        }
        arrayOfEvent.forEach(async element => {
            if (element.author && Object.keys(element.author).length > 0) {
                UserEventNotification.push({
                    'id': element.id,
                    'firstName': element.author.firstname,
                    'lastName': element.author.lastname,
                    'title': element.name,
                    'notificationType': 'invitedEventsNotifications',
                    'created_at': element.updated_at,
                })
            }
        })
        handler.success(UserEventNotification);
    }
    catch (error) {
        handler.error(error);
    }
}


/**
* Function to get all 
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Group details
*/
CommonApiController.getGroupNotificationForUser = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let UserGroupNotification = [];
    try {
        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll();
        let group_notification = await new GroupParticipantsModel()
            .where({ approved_status: 2 })
            .fetchAll({
                withRelated: ['user', 'group']
            });
        group_notification.toJSON().forEach(element => {
            if (element && Object.keys(element.group).length > 0 && element.group.created_by == user_id.toJSON()[0].id && Object.keys(element.user).length > 0  && (element.user.team_id == element.group.team_id)) {
                UserGroupNotification.push({
                    'id': element.group_id,
                    'firstName': element.user.firstname,
                    'lastName': element.user.lastname,
                    'title': element.group.name,
                    'notificationType': 'groupNotifications',
                    'created_at': element.group.created_at,
                    'userId': element.user_id
                })
            }
        })

        let unapporvedUserGroup = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetchAll({
            columns: ['id', 'username'],
            withRelated: [
                'usergr.groups.createdby',
            ]
        });
        let arrayOfGroups = [];
        if (unapporvedUserGroup) {
            unapporvedUserGroup = unapporvedUserGroup.toJSON();
            unapporvedUserGroup = unapporvedUserGroup[0];
            unapporvedUserGroup && unapporvedUserGroup.usergr && unapporvedUserGroup.usergr.forEach(gr => {
                if (gr.approved_status == 0) {
                    gr.groups.forEach(groups => {
                        if (groups.approved_status) {
                            arrayOfGroups.push(groups);
                        }
                    });
                }
            });
        }
        arrayOfGroups = arrayOfGroups.reverse()
        arrayOfGroups.forEach(element => {
            if (element && element.createdby && Object.keys(element.createdby).length > 0 && (element.team_id == userInfo.attributes.vv_club_id)) {
                UserGroupNotification.push({
                    'id': element.id,
                    'firstName': element.createdby.firstname,
                    'lastName': element.createdby.lastname,
                    'title': element.name,
                    'notificationType': 'unapprovedUserGroups',
                    'created_at': element.created_at,
                })
            }
        })

        let GroupNotificationUser = await new GroupParticipantsModel()
            .where({ approved_status: 1, group_updated_status: 1, user_id: user_id.toJSON()[0].id })
            .fetchAll({
                withRelated: [{
                    'group': function (qb) {
                        qb.where({ approved_status: 1 })
                    }
                }, 'group.createdby']
            });
        GroupNotificationUser.toJSON().forEach(element => {
            if (element && Object.keys(element.group).length > 0 && Object.keys(element.group.createdby).length > 0 && (element.group.team_id == userInfo.attributes.vv_club_id)) {
                UserGroupNotification.push({
                    'id': element.group_id,
                    'firstName': element.group.createdby.firstname,
                    'lastName': element.group.createdby.lastname,
                    'title': element.group.name,
                    'notificationType': 'updatedGroupNotificationForExistingUsers',
                    'created_at': element.created_at,
                })
            }
        })

        let accept_group_user = await new GroupParticipantsModel()
            .where({ approved_status: 1, read_status: 0, user_id: user_id.toJSON()[0].id })
            .fetchAll({
                withRelated: [{
                    'group.createdby': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }]
            });
        accept_group_user.toJSON().forEach(element => {
            if (element && Object.keys(element.group).length > 0 && Object.keys(element.group.createdby).length > 0) {
                UserGroupNotification.push({
                    'id': element.group_id,
                    'firstName': element.group.createdby.firstname,
                    'lastName': element.group.createdby.lastname,
                    'title': element.group.name,
                    'notificationType': 'AcceptGroupUserNotifications',
                    'created_at': element.group.updated_at,
                })
            }
        })

        let publish_group = await new GroupsModel()
            .where({ created_by: user_id.toJSON()[0].id, team_id : userInfo.attributes.vv_club_id  , approved_status: 1, is_read: 1 })
            .fetchAll({
                withRelated: [{
                    'approvedby': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }]
            });

        publish_group.toJSON().forEach(element => {
            if (element && element.approvedby && Object.keys(element.approvedby).length > 0) {
                UserGroupNotification.push({
                    'id': element.id,
                    'firstName': element.approvedby.firstname,
                    'lastName': element.approvedby.lastname,
                    'title': element.name,
                    'notificationType': 'getPublishedGroupNotificationtoCreator',
                    'created_at': element.updated_at,
                })
            }
        })

        let deny_group = await new GroupsModel()
            .where({ created_by: user_id.toJSON()[0].id , team_id : userInfo.attributes.vv_club_id })
            .whereNotNull("deny_reason")
            .fetchAll({
                withRelated: [{
                    'denybyuser': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }]
            });
        deny_group.toJSON().forEach(element => {
            if (element && element.denybyuser && Object.keys(element.denybyuser).length > 0) {
                UserGroupNotification.push({
                    'id': element.id,
                    'firstName': element.denybyuser.firstname,
                    'lastName': element.denybyuser.lastname,
                    'title': element.name,
                    'notificationType': 'denyGroupNotifications',
                    'created_at': element.updated_at,
                    'deny_reason': element.deny_reason,
                })
            }
        })
        handler.success(UserGroupNotification);
    }
    catch (error) {
        handler.error(error);
    }
}


/**
* Function to get all 
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Task details
*/
CommonApiController.getTaskNotificationForUser = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let UserTaskNotification = [];
    try {
        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll({ columns: ['id', 'email'] })
        let user_unapproveTask = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetchAll({
            columns: ['id', 'username', 'firstname', 'lastname'],
            withRelated: [
                'userta.taskss.subtasks',
                {
                    'userta.taskss.userstask': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }
            ]
        });
        let arrayOfTasks = [];
        if (user_unapproveTask) {
            user_unapproveTask = user_unapproveTask.toJSON();
            user_unapproveTask = user_unapproveTask[0];
            user_unapproveTask && user_unapproveTask.userta && user_unapproveTask.userta.forEach(gr => {
                if (gr.approved_status == 1 && gr.read_status != 1) {  // only approved status
                    gr.taskss.forEach(taskss => {
                        if (taskss.status != 2) {
                            arrayOfTasks.push(taskss);
                        }
                    });
                }
            });
        }
        arrayOfTasks.forEach(element => {
            if(element.userstask && Object.keys(element.userstask).length > 0){
            UserTaskNotification.push({
                'id': element.id,
                'firstName': element.userstask.firstname,
                'lastName': element.userstask.lastname,
                'title': element.title,
                'notificationType': 'unapprovedTasks',
                'created_at': element.created_at,
            })
        }
        })

        let user_unapproveSubTask = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetchAll({
            columns: ['id', 'username'],
            withRelated: [
                'usersubta.subtasks.tasks', {
                    'usersubta.subtasks.tasks.userstask': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }
            ]
        });
        let arrayOfsubTasks = [];
        if (user_unapproveSubTask) {
            user_unapproveSubTask = user_unapproveSubTask.toJSON();
            user_unapproveSubTask = user_unapproveSubTask[0];
            user_unapproveSubTask && user_unapproveSubTask.usersubta && user_unapproveSubTask.usersubta.forEach(gr => {
                if (gr.approved_status == 1 && gr.read_status != 1) {  // only approved status
                    gr.subtasks.forEach(taskss => {
                        if (taskss.tasks.status != 2) {
                            arrayOfsubTasks.push(taskss);
                        }
                    });
                }
            });
        }
        arrayOfsubTasks.forEach(element => {
            if(element.tasks && Object.keys(element.tasks).length > 0 &&  Object.keys(element.tasks.userstask).length > 0 ){
            UserTaskNotification.push({
                'id': element.id,
                'firstName': element.tasks.userstask.firstname,
                'lastName': element.tasks.userstask.lastname,
                'title': element.title,
                'notificationType': 'unapprovedSubTask',
                'created_at': element.tasks.created_at,
                "task_id": element.task_id
            })
        }
        })

        let accept_task = await new TasksModel().where({ organizer_id: user_id.toJSON()[0].id, status: 0, is_read: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: ['approvedBy']
        });
        accept_task.toJSON().forEach(element => {
            if (element && element.approvedBy && Object.keys(element.approvedBy).length > 0) {
                UserTaskNotification.push({
                    'id': element.id,
                    'firstName': element.approvedBy.firstname,
                    'lastName': element.approvedBy.lastname,
                    'title': element.title,
                    'notificationType': 'getAcceptPublishTaskByAdminNotificationstoCreator',
                    'created_at': element.updated_at,
                })
            }
        })

        let deny_task = await new TasksModel().where({ organizer_id: user_id.toJSON()[0].id }).whereNotNull('deny_reason').orderBy('id', 'desc').fetchAll({
            withRelated: ['denyBy']
        });
        deny_task.toJSON().forEach(element => {
            if (element && element.denyBy && Object.keys(element.denyBy).length > 0) {
                UserTaskNotification.push({
                    'id': element.id,
                    'firstName': element.denyBy.firstname,
                    'lastName': element.denyBy.lastname,
                    'title': element.title,
                    'notificationType': 'getDenyPublishTaskByAdminNotificationstoCreator',
                    'created_at': element.updated_at,
                    'deny_reason': element.deny_reason,
                })
            }
        })

        let approve_update_task = await new TasksModel().where({ organizer_id: user_id.toJSON()[0].id , update_approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: ['approvedBy']
        });
        approve_update_task.toJSON().forEach(element => {
            if (element && element.approvedBy  && Object.keys(element.approvedBy).length > 0) {
                UserTaskNotification.push({
                    'id': element.id,
                    'firstName': element.approvedBy.firstname,
                    'lastName': element.approvedBy.lastname,
                    'title': element.title,
                    'notificationType': 'acceptUpdatedTaskByAdminNotificationstoCreator',
                    'created_at': element.updated_at,
                })
            }
        })

        let updateTask_existingUser = await new TaskCollaboratorsModel()
            .where({ approved_status: 1, task_updated_status: 1, user_id: user_id.toJSON()[0].id })
            .fetchAll({
                withRelated: ['user',
                    'taskss.group',
                    {
                        'taskss.userstask': function (qb) {
                            qb.select('id', 'firstname', 'lastname')
                        }
                    }]
            });
        updateTask_existingUser.toJSON().forEach(element => {
            if (element.taskss && Object.keys(element.taskss).length > 0 && Object.keys(element.taskss[0].userstask).length > 0) {
                UserTaskNotification.push({
                    'id': element.taskss[0].id,
                    'firstName': element.taskss[0].userstask.firstname,
                    'lastName': element.taskss[0].userstask.lastname,
                    'title': element.taskss[0].title,
                    'notificationType': 'updatedTaskNotificationForExistingUsers',
                    'created_at': element.taskss[0].updated_at,
                })
            }
        })

        let complete_task = await new TasksModel().where({ status: 1, organizer_id: user_id.toJSON()[0].id, complete_read_status: 0 })
            .fetchAll({
                withRelated: ['userstask']
            });

        complete_task.toJSON().forEach(element => {
            if (element && element.userstask && Object.keys(element.userstask).length > 0) {
                UserTaskNotification.push({
                    'id': element.id,
                    'firstName': element.userstask.firstname,
                    'lastName': element.userstask.lastname,
                    'title': element.title,
                    'notificationType': 'completedTaskNotificationToOrganizer',
                    'created_at': element.updated_at,
                })
            }
        })

        handler.success(UserTaskNotification);
    }
    catch (error) {
        handler.error(error);
    }
}


/**
* Function to get all Notification Instructor details for user
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Instructor details
*/
CommonApiController.getInstructorNotificationForUser = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);

    let UserInstructorNotifications = [];
    try {
        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll({ columns: ['id', 'email'] })

        let deny_instructor = await new InstructorModel().where({ author: user_id.toJSON()[0].id }).whereNotNull('deny_reason').orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'denyById': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });
        deny_instructor.toJSON().forEach(element => {
            if (element && element.denyById && Object.keys(element.denyById).length > 0 ) {
                UserInstructorNotifications.push({
                    'id': element.id,
                    'firstName': element.denyById.firstname,
                    'lastName': element.denyById.lastname,
                    'title': element.emaill,
                    'notificationType': 'denyInstructNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        })

        let approved_instructor = await new InstructorModel().where({ author: user_id.toJSON()[0].id, approved_status: 1, is_read: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'instructorAuthor': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });

        approved_instructor.toJSON().forEach(element => {
            if (element && element.instructorAuthor && Object.keys(element.instructorAuthor).length > 0) {
                UserInstructorNotifications.push({
                    'id': element.id,
                    'firstName': element.instructorAuthor.firstname,
                    'lastName': element.instructorAuthor.lastname,
                    'title': element.emaill,
                    'notificationType': 'approvedInstructNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        })

        let update_instructor = await new InstructorModel().where({ author: user_id.toJSON()[0].id, update_approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: ['instructorAuthor']
        });
        update_instructor.toJSON().forEach(element => {
            if (element && element.instructorAuthor && Object.keys(element.instructorAuthor).length > 0) {
                UserInstructorNotifications.push({
                    'id': element.id,
                    'firstName': element.instructorAuthor.firstname,
                    'lastName': element.instructorAuthor.lastname,
                    'title': element.emaill,
                    'notificationType': 'approvedUpdateInstructNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        })

        handler.success(UserInstructorNotifications);
    } catch (error) {
        handler.error(error);
    }
}



/**
* Function to get all course Notification for user
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Course details
*/
CommonApiController.getCourseNotificationForUser = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let UserCourseNotification = [];
    try {
        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll({ columns: ['id', 'email'] })
        let internal_course_instructor = await new CourseInternalInstructorModel()
            .where({ user_id: user_id.toJSON()[0].id, is_read: 1, course_update_status: 0 })
            .fetchAll({
                withRelated: [{
                    'course': function (qb) {
                        qb.where({ approved_status: 1 })
                    }
                }, 'course.author']
            })

        internal_course_instructor.toJSON().forEach(element => {
            if (element && element.course && element.course.author && Object.keys(element.course.author).length > 0) {
                UserCourseNotification.push({
                    'id': element.course_id,
                    'firstName': element.course.author.firstname,
                    'lastName': element.course.author.lastname,
                    'title': element.course.name,
                    'notificationType': 'internalCourseInstructorNotifications',
                    'created_at': element.course.created_at,
                })
            }
        })

        let update_course_internalIns = await new CourseInternalInstructorModel()
            .where({ user_id: user_id.toJSON()[0].id, is_read: 1, course_update_status: 1 })
            .fetchAll({
                withRelated: [{
                    'course': function (qb) {
                        qb.where({ approved_status: 1 })
                    }
                }, 'course.author']
            });

        update_course_internalIns.toJSON().forEach(element => {
            if (element && element.course && element.course.author && Object.keys(element.course.author).length > 0) {
                UserCourseNotification.push({
                    'id': element.course_id,
                    'firstName': element.course.author.firstname,
                    'lastName': element.course.author.lastname,
                    'title': element.course.name,
                    'notificationType': 'internalUpdateCourseInstructorNotifications',
                    'created_at': element.course.updated_at
                })
            }
        })

        let approved_course = await new CoursesModel()
            .where({ author: user_id.toJSON()[0].id, approved_status: 1, is_read: 1 })
            .fetchAll({
                withRelated: [{
                    'approvedbyuser': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }]
            });

        approved_course.toJSON().forEach(element => {
            if (element && element.approvedbyuser && Object.keys(element.approvedbyuser).length > 0) {
                UserCourseNotification.push({
                    'id': element.id,
                    'firstName': element.approvedbyuser.firstname,
                    'lastName': element.approvedbyuser.lastname,
                    'title': element.name,
                    'notificationType': 'approvedCourseNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        })

        let deny_course = await new CoursesModel().where({ author: user_id.toJSON()[0].id }).whereNotNull('deny_reason').orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'denybyuser': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });

        deny_course.toJSON().forEach(element => {
            if (element && element.denybyuser && Object.keys(element.denybyuser).length > 0) {
                UserCourseNotification.push({
                    'id': element.id,
                    'firstName': element.denybyuser.firstname,
                    'lastName': element.denybyuser.lastname,
                    'title': element.name,
                    'notificationType': 'denyCourseNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        })

        let update_course = await new CoursesModel().where({ author: user_id.toJSON()[0].id, update_approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'approvedbyuser': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });

        update_course.toJSON().forEach(element => {
            if (element && element.approvedbyuser && Object.keys(element.approvedbyuser).length > 0) {
                UserCourseNotification.push({
                    'id': element.id,
                    'firstName': element.approvedbyuser.firstname,
                    'lastName': element.approvedbyuser.lastname,
                    'title': element.name,
                    'notificationType': 'approvedUpdateCourseNotificationsToCreator',
                    'created_at': element.updated_at,
                })
            }
        })


        let update_course_existingUser = await new CourseUsersModel()
            .where({ user_id: user_id.toJSON()[0].id, approved_status: 1, course_updated_status: 1 })
            .fetchAll({
                withRelated: [{
                    'courses.user': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }]
            });

        update_course_existingUser.toJSON().forEach(element => {
            if (element && element.courses && element.courses.user && Object.keys(element.courses.user).length > 0) {
                UserCourseNotification.push({
                    'id': element.course_id,
                    'firstName': element.courses.user.firstname,
                    'lastName': element.courses.user.lastname,
                    'title': element.courses.name,
                    'notificationType': 'updatedCourseNotificationForExistingUsers',
                    'created_at': element.courses.created_at,
                })
            }
        })

        let invite_course = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetch({
            withRelated: [{
                'course_user.courses.user': function (qb) {
                    qb.select('id', 'firstname', 'lastname')
                }
            }]
        });
        let arrayOfCours = [];
        if (invite_course) {
            invite_course = invite_course.toJSON();
            await invite_course && invite_course.course_user.forEach(course => {
                if (course.approved_status == 0 && course.courses.approved_status == 1) {
                    arrayOfCours.push(course.courses);
                }
            })
        }
        arrayOfCours.forEach(element => {
            if (element && element.user && Object.keys(element.user).length > 0) {
                UserCourseNotification.push({
                    'id': element.id,
                    'firstName': element.user.firstname,
                    'lastName': element.user.lastname,
                    'title': element.name,
                    'notificationType': 'invitedCoursesNotifications',
                    'created_at': element.created_at,
                })
            }
        })

        let course_join_notif = await new CourseUsersModel()
            .where({ approved_status: 2 })
            .fetchAll({
                withRelated: [{
                    'users': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }, {
                    'courses': function (qb) {
                        qb.where({ author: user_id.toJSON()[0].id })
                    }
                }]
            });

        course_join_notif.toJSON().forEach(element => {
            if (element && element.users && Object.keys(element.users).length > 0 && element.courses && Object.keys(element.courses).length > 0) {
                UserCourseNotification.push({
                    'id': element.course_id,
                    'firstName': element.users.firstname,
                    'lastName': element.users.lastname,
                    'title': element.courses.name,
                    'notificationType': 'userWantsToJoinCourseNotificationToCreator',
                    'created_at': element.courses.created_at,
                    'userIId': element.user_id
                })
            }
        })

        let accept_course_join = await new CourseUsersModel()
            .where({ user_id: user_id.toJSON()[0].id, approved_status: 1, read_status: 0 })
            .fetchAll({
                withRelated: [{
                    'courses.user': function (qb) {
                        qb.select('id', 'firstname', 'lastname')
                    }
                }]
            });

        accept_course_join.toJSON().forEach(element => {
            if (element && element.courses && Object.keys(element.courses).length > 0 && Object.keys(element.courses.user).length > 0) {
                UserCourseNotification.push({
                    'id': element.course_id,
                    'firstName': element.courses.user.firstname,
                    'lastName': element.courses.user.lastname,
                    'title': element.courses.name,
                    'notificationType': 'userJoinedByCreatorNotification',
                    'created_at': element.courses.created_at,
                })
            }
        })

        handler.success(UserCourseNotification);
    }
    catch (error) {
        handler.error(error);
    }
}


/**
* Function to get all unapproved Survey Notification, unapporved updated survey Notification details for user
* @author  MangoIt Solutions
* @param  {} 
* @return {object} Survey details
*/
CommonApiController.getSurveyNotificationForUser = async function (req, res) {
    let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
    let handler = new ApiHandler(req, res);
    let UserSurveyNotification = [];
    try {
        let user_id = await new UserModel().where({ email: userInfo.email }).fetchAll()
        let unapprovedsurvey_user = await new UserModel().where({ id: user_id.toJSON()[0].id }).orderBy('id', 'desc').fetch({
            withRelated: [{
                'survey_user.surveys.user_name': function (qb) {
                    qb.select('id', 'firstname', 'lastname');
                }
            }]
        });
        let arrayOfSurvey = [];
        let arrayofSurv = [];
        if (unapprovedsurvey_user) {
            unapprovedsurvey_user = unapprovedsurvey_user.toJSON();
            await unapprovedsurvey_user && unapprovedsurvey_user.survey_user && unapprovedsurvey_user.survey_user.forEach(e => {
                if (e.surveys.approved_status == 1 && e.read_status == 0) {
                    if (e.approvedStatus == 0) {
                        arrayOfSurvey.push(e.surveys);
                    }
                }
            })
        }
        arrayofSurv = arrayOfSurvey.reverse();
        arrayofSurv.forEach(element => {
            if (element && element.user_name && Object.keys(element.user_name).length > 0) {
            UserSurveyNotification.push({
                'id': element.id,
                'firstName': element.user_name.firstname,
                'lastName': element.user_name.lastname,
                'title': element.title,
                'notificationType': 'invitedSurveyNotifications',
                'created_at': element.created_at,
            })
        }
        })

        let deny_survey = await new SurveyModel().where({ user_id: user_id.toJSON()[0].id }).whereNotNull('deny_reason').orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'user_name': function (qb) {
                    qb.select('id', 'firstname', 'lastname');
                }, 'denybyuser': function (qb) {
                    qb.select('id', 'firstname', 'lastname');
                }
            }]
        });

        deny_survey.toJSON().forEach(element => {
            if (element && element.denybyuser && Object.keys(element.denybyuser).length > 0) {
                UserSurveyNotification.push({
                    'id': element.id,
                    'firstName': element.denybyuser.firstname,
                    'lastName': element.denybyuser.lastname,
                    'title': element.title,
                    'notificationType': 'getDenyPublishSurveyByAdminNotificationstoCreator',
                    'created_at': element.updated_at,
                    'deny_reason': element.deny_reason,
                })
            }
        })

        let publish_survey = await new SurveyModel()
            .where({ user_id: user_id.toJSON()[0].id, approved_status: 1, is_read: 1 })
            .fetchAll({
                withRelated: [{
                    'approvedbyuser': function (qb) {
                        qb.select('id', 'firstname', 'lastname');
                    }
                }]
            });

        publish_survey.toJSON().forEach(element => {
            if (element && element.approvedbyuser && Object.keys(element.approvedbyuser).length > 0) {
                UserSurveyNotification.push({
                    'id': element.id,
                    'firstName': element.approvedbyuser.firstname,
                    'lastName': element.approvedbyuser.lastname,
                    'title': element.title,
                    'notificationType': 'getAcceptPublishSurveyByAdminNotificationstoCreator',
                    'created_at': element.updated_at,
                })
            }
        });

        let published_update_survey = await new SurveyModel().where({ user_id: user_id.toJSON()[0].id, update_approved_status: 1 }).orderBy('id', 'desc').fetchAll({
            withRelated: [{
                'approvedbyuser': function (qb) {
                    qb.select('id', 'firstname', 'lastname');
                }
            }]
        });
        published_update_survey.toJSON().forEach(element => {
            if (element && element.approvedbyuser && Object.keys(element.approvedbyuser).length > 0) {
                UserSurveyNotification.push({
                    'id': element.id,
                    'firstName': element.approvedbyuser.firstname,
                    'lastName': element.approvedbyuser.lastname,
                    'title': element.title,
                    'notificationType': 'publishUpdateSurveyByAdminNotificationstoCreator',
                    'created_at': element.updated_at,
                })
            }
        });

        handler.success(UserSurveyNotification);
    }
    catch (error) {
        handler.error(error);
    }
}

module.exports = CommonApiController;






