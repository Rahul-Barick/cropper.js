var config = require('../configs/config.js');
var ObjectID = require('mongodb').ObjectID;
var constants = require("../configs/constants.js");

module.exports = function (req, res, next) {
    if (!req.session || !req.session.username) {
        res.redirect(config[config.env].base_url + 'login');
        return;
    }
    next();
};