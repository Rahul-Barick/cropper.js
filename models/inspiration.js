var mongo_connection = require('../helpers/connect_mongo.js');
var db_constants = require('../configs/db_constants.js');

module.exports = {
    create: function (data, callback) {
        var db = mongo_connection.get_connection();
        db.collection(db_constants.INSPIRATION).insertOne(data, function (err, results) {
            callback(err, data)
        })
    },
    get_all: function (filter, project, limit, skip, callback) {
        var db = mongo_connection.get_connection();
        db.collection(db_constants.INSPIRATION).find(filter).project(project).sort({
            styling: 1,
            ocassion: 1
        }).limit(limit).skip(skip).toArray(callback);
    },
    search: function (filter, project, skip, limit, callback) {
        var db = mongo_connection.get_connection();
        db.collection(db_constants.INSPIRATION).find(filter).project(project).sort({
            created_at: -1
        }).skip(skip).limit(limit).toArray(callback);
    },
    count: function (filter, callback) {
        var db = mongo_connection.get_connection();
        db.collection(db_constants.INSPIRATION).count(filter, callback);
    },
    get: function (filter, project, callback) {
        var db = mongo_connection.get_connection();
        db.collection(db_constants.INSPIRATION).find(filter).project(project).limit(1).next(callback);
    },
    update: function (filter, update, callback) {
        var db = mongo_connection.get_connection();
        db.collection(db_constants.INSPIRATION).updateOne(filter, update, callback);
    },
    remove: function (filter, callback) {
        var db = mongo_connection.get_connection();
        db.collection(db_constants.INSPIRATION).remove(filter, callback)
    },
    get_style_list: function (filter, callback) {
        var db = mongo_connection.get_connection();
        db.collection(db_constants.STYLE).find(filter).toArray(callback);
    },
    get_ocassion_list: function (filter, callback) {
        var db = mongo_connection.get_connection();
        db.collection(db_constants.OCASSION).find(filter).toArray(callback);
    }
};