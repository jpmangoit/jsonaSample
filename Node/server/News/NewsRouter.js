'use strict';
const express = require('express');
const multerMW = require('../lib/Multer');
const app = express();
const Keycloak = require('keycloak-connect');
const session = require('express-session');
var bodyParser = require('body-parser');
const Utils = require('../utils/utils');
var memoryStore = new session.MemoryStore();
var keycloak = new Keycloak({ store: memoryStore });
const kc = require('../../config/keycloakconfig.js').getKeycloak();
app.use(session({
    secret: 'thisShouldBeLongAndSecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));
// app.use(keycloak.middleware());

app.use(bodyParser.json());

let NewsController = require(__dirname + '/NewsController');
module.exports = function (app) {
    app.get('/api/get-news-by-id/:id', NewsController.getNewsById);
    app.get('/api/topNews/user/:id', Utils.getTokenUserData, kc.protect(), NewsController.getTopNews);
}