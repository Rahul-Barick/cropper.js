var http_status = require('../helpers/http_stasuses.js');
var util = require('../helpers/util.js');
var models = require('../models');
var async = require('async');
var constants = require('../configs/constants.js');
var config = require('../configs/config.js');
var ObjectID = require('mongodb').ObjectID;
var _ = require('lodash');
var moment = require('moment');

module.exports = {
    login_view: function (req, res, next) {
        if (req.session && req.session.user_id) {
            res.redirect(config[config.env].base_url + 'inspirations/list');
            return;
        }
        var render_data = {};
        if (req.query.unauthorized) {
            render_data.error_message = 'Incorrect Username or Password';
        }
        res.render('login.pug', render_data);
    },
    login: function (req, res, next) {
        var filter = {
            username: req.body.username,
            password: req.body.password
        };
        models.user.get(filter, {}, function (err, user_details) {
            if (err || !user_details) {
                res.redirect(config[config.env].base_url + 'login?unauthorized=1');
                return;
            }
            req.session.user_id = user_details['_id'];
            req.session.username = user_details['username'];
            res.redirect(config[config.env].base_url + 'inspirations/list');
        });
    },
    logout: function (req, res, next) {
        req.session.destroy();
        res.redirect(config[config.env].base_url + 'login');
    }
};