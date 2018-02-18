var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + 'died');
        process.exit(1);
    });
} else {
    var express = require('express');
    var app = express();
    var config = require('./configs/config.js');
    var http_status = require('./helpers/http_stasuses.js');
    var bodyParser = require('body-parser');
    var routes = require('./routes');
    var session = require('express-session');
    var mongo_store = require('connect-mongo')(session);

    // ENV
    console.log("ENV --> " + config.env);

    // Mongo Connection
    require('./helpers/connect_mongo.js').connect_mongo(function () {
        // parse form url encoded
        app.use(bodyParser.urlencoded({limit: '1024kb', extended: false}));

        //set views folder
        app.set('views', './assets/views');
        app.set('view engine', 'pug');

        // Static Contents
        app.use('/css', express.static('./assets/css'));
        app.use('/js', express.static('./assets/js'));
        app.use('/fonts', express.static('./assets/css/fonts'));

        //session middleware
        app.use(session({
            store: new mongo_store({db: require('./helpers/connect_mongo.js').get_connection()}),
            secret: config[config.env].session_secret,
            resave: false,
            saveUninitialized: true
        }));

        // Locals
        app.use(function (req, res, next) {
            res.locals.base_url = config[config.env].base_url;
            if (req.session && req.session.username) {
                res.locals.sess_username = req.session.username;
            }
            next();
        });

        // API Routes
        app.use('/', routes);

        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            http_status.NOT_FOUND(res);
        });

        // error handler
        app.use(function (err, req, res, next) {
            http_status.INTERNAL_SERVER_ERROR(res, {message: err.message});
        });

        app.listen(config[config.env].PORT,() => {
            console.log(`Server listening on Port ${config[config.env].PORT}`);
        });
    });
    module.exports = app;
}

