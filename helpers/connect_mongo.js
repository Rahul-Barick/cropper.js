var config = require('../configs/config.js');

var state = {db: null};

module.exports = {
    connect_mongo: function (callback) {
        if (!state.db) {
            var MongoClient = require('mongodb').MongoClient;
            var host = config[config.env].mongodb.host;
            var port = config[config.env].mongodb.port;
            var db_name = config[config.env].mongodb.db;
            var url = 'mongodb://' + host + ':' + port + '/' + db_name;
            // Use connect method to connect to the server
            MongoClient.connect(url, config[config.env].mongodb.connection_options, function (err, db) {
                if (err) {
                    console.log("Mongo Connection Failed");
                    process.exit(1);
                    return;
                }
                console.log("Connected successfully to Mongodb server");
                state.db = db;
                callback();
            });
        } else {
            callback();
        }
    },
    get_connection: function () {
        return state.db;
    }

};



