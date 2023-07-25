const jwt = require('jsonwebtoken');

let isAdmin = function (auth) {
    let token = auth.split('Bearer ')[1];
    let inf = jwt.decode(token);
    let roles = inf.resource_access[`${process.env.clientId}`].roles;
    let admin = false;
    if (roles.indexOf('admin') > -1) {
        admin = true;
        return admin;
    }
    return admin;
}

let isSecretary = function (auth) {
    let inf = jwt.decode(auth);
    let roles = inf.resource_access[`${process.env.clientId}`].roles;
    let secretary = false;
    if (roles.indexOf('secretary') > -1) {
        secretary = true;
        return secretary;
    }
    return secretary;
}

let isMember = function (auth) {
    let inf = jwt.decode(auth);
    let roles = inf.resource_access[`${process.env.clientId}`].roles;
    let member = false;
    if (roles.indexOf('member') > -1) {
        member = true;
        return member;
    }
    return member;
}

let isEditor = function (auth) {
    let inf = jwt.decode(auth);
    let roles = inf.resource_access[`${process.env.clientId}`].roles;
    let editor = false;
    if (roles.indexOf('editor') > -1) {
        editor = true;
        return editor;
    }
    return editor;
}


let isGuest = function (auth) {
    let inf = jwt.decode(auth);
    let roles = inf.resource_access[`${process.env.clientId}`].roles;
    let guest = false;
    if (roles.indexOf('guest') > -1) {
        guest = true;
        return guest;
    }
    return guest;
}

let isFunctionary = function (auth) {
    let token = auth.split('Bearer ')[1];
    let inf = jwt.decode(token);
    let roles = inf.resource_access[`${process.env.clientId}`].roles;
    let funcionary = false;
    if (roles.indexOf('functionary') > -1) {
        funcionary = true;
        return funcionary;
    }
    return funcionary
}

let isGuestCheck = function (auth) {
    let token = auth.split('Bearer ')[1];
    let inf = jwt.decode(token);
    let guest = false;
    if (inf === null) {
        guest = false;
    }
    else {
        let roles = inf.resource_access[`${process.env.clientId}`].roles;
        if (roles.indexOf('guest') > -1) {
            guest = true;
            return guest;
        }
    }
    return guest;
}

let isMember_light = function (auth) {
    let inf = jwt.decode(auth);
    let roles = inf.resource_access[`${process.env.clientId}`].roles;
    let member_light = false;
    if (roles.indexOf('member_light') > -1) {
        member_light = true;
        return member_light;
    }
    return member_light;
}

let isMember_light_admin = function (auth) {
        let token = auth.split('Bearer ')[1];
        let inf = jwt.decode(token);
        let roles = inf.resource_access[`${process.env.clientId}`].roles;
        let member_light_admin = false;
        if (roles.indexOf('member_light_admin') > -1) {
            member_light_admin = true;
            return member_light_admin;
        }
        return member_light_admin;
}

module.exports = {
    isAdmin,
    isFunctionary,
    isGuest,
    isEditor,
    isSecretary,
    isMember,
    isGuestCheck,
    isMember_light,
    isMember_light_admin
}