var mongo_connection = require('../helpers/connect_mongo.js');
var db_constants = require('../configs/db_constants.js');

module.exports = {
    get: function (filter, project, callback) {
        var db = mongo_connection.get_connection();
        db.collection(db_constants.DASHBOARD_USERS).find(filter).project(project).limit(1).next(callback);
    }
};

