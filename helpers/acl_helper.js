var config = require('../configs/config.js');
var ObjectID = require('mongodb').ObjectID;

module.exports = function (req, res, next) {
    if (!req.session || !req.session.username) {
        res.redirect(config[config.env].base_url + 'login');
        return;
    }
    next();
};