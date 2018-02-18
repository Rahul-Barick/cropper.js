var http_status = require('../helpers/http_stasuses.js');
var models = require('../models');
var async = require('async');
var constants = require('../configs/constants.js');
var config = require('../configs/config.js');
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
var fs = require('fs');
var util = require('../helpers/util.js');
var Promise = require('bluebird');

module.exports = {
    add_view: function (req, res, next) {
        var render_data = {};
        render_data.created = req.query.created || null;
        render_data.error_message = req.query.error_message || null;
        var filter = {};
        Promise.all([search_list_style(filter), search_list_ocassion(filter)])
            .then(function (data) {
                render_data.styling = data[0];
                render_data.ocassion = data[1];
                res.render('inspirations_add.pug', render_data)
            })
            .catch(function (e) {
                http_status.INTERNAL_SERVER_ERROR(res, e);
            })
    },
    add: function (req, res, next) {
        var filter = {};
        async.waterfall([
            function (upload_photo_callback) {

                if (!req.file) {
                    upload_photo_callback(null, null);
                    return;
                }
                if (req.file) {
                    filter.url = req.file.filename + "" + req.file.path;
                    upload_photo_callback(null, filter.url);
                    return;
                }
            },
            function (upload_data, insert_inspiration_callback) {
                req.body.photo_url = upload_data ? upload_data.location : null;
                if (req.body.ocassion && typeof req.body.ocassion === "string") {
                    req.body.ocassion = [req.body.ocassion];
                }
                var filter = {};
                filter.caption = req.body.caption;
                filter.styling = req.body.styling;
                filter.ocassion = req.body.ocassion;
                filter.photo_url = req.body.photo_url;
                models.inspiration.create(filter, function (err, inspiration_data) {
                    if (err) {
                        insert_inspiration_callback(err);
                        return;
                    }
                    insert_inspiration_callback(null, inspiration_data);
                });
            }
        ], function (err, inspiration_data) {
            if (err) {
                http_status.INTERNAL_SERVER_ERROR(res, {
                    message: err.message
                });
            }
            http_status.OK(res, {
                message: "OK"
            });
        })
    },
    list: function (req, res, next) {
        var render_data = {};
        var filter = {};
        Promise.join(search_list_style(filter), search_list_ocassion(filter), function (style, ocassion) {
            render_data.styling = style;
            render_data.ocassion = ocassion;
            res.render('inspirations_list.pug', render_data);
        })
    },
    get_all_by_style_occasion: function (req, res, next) {
        var filter = {};
        if (req.query.styling) {
            filter.styling = typeof (req.query.styling) === 'string' ? req.query.styling : {
                $in: req.query.styling
            }
        }
        if (req.query.ocassion) {
            filter.ocassion = typeof (req.query.ocassion) === 'string' ? req.query.ocassion : {
                $in: req.query.ocassion
            }
        }
        if (req.query.styling && req.query.ocassion) {
            var andFilter = {};
            andFilter["$and"] = [{
                styling: filter.styling
            }, {
                ocassion: filter.ocassion
            }];
            filter = andFilter;
        }

        var limit = req.query.limit ? Number(req.query.limit) || 10 : 10;
        var offset = req.query.offset ? Number(req.query.offset) || 0 : 0;
        if (limit > 100) {
            limit = 100;
        };

        models.inspiration.get_all(filter, {}, limit, offset, function (err, inspiration) {
            if (err) {
                http_status.INTERNAL_SERVER_ERROR(res, {
                    message: err.message
                });
                return;
            }
            var final_response = {
                "status": 200,
                "message": "success",
                "data": inspiration
            }
            http_status.OK(res, final_response);
        });
    },
    get_all: function (req, res, next) {
        var filter = {};
        if (req.body.search.value) {
            var search_val = JSON.parse(req.body.search.value);

            if (search_val && search_val.caption) {
                filter.caption = new RegExp(search_val.caption, "i");

            }
            if (search_val && search_val.styling) {
                filter.styling = {
                    "$in": search_val.styling
                }
            }
            if (search_val.ocassion) {
                filter.ocassion = new RegExp(search_val.ocassion, "i");
            }
        };
        Promise.all([search_inspiration(filter, req.body), get_inspiration_count(filter)])
            .then(function (values) {
                var response_json = {
                    "draw": req.body.draw,
                    "recordsTotal": values[1],
                    "recordsFiltered": values[1],
                    "data": values[0]
                };
                http_status.OK(res, response_json);
            })
            .catch(function (e) {
                http_status.INTERNAL_SERVER_ERROR(res, e);
            })
    },
    edit: function (req, res, next) {

        var validate_object_ids_array = [{
            id: req.params.inspiration_id,
            message: "Invalid Inspiration ID"
        }];
        var validate_object_ids = util.validate_object_ids(validate_object_ids_array);
        if (!validate_object_ids.is_validated) {
            res.redirect(config[config.env].base_url + 'inspiratons/list');
            return;
        }
        var render_data = {};
        var filter = {
            _id: new ObjectID(req.params.inspiration_id)
        };
        var filter_style_ocassion = {};
        models.inspiration.get(filter, {}, function (err, inspiration) {
            if (err) {
                res.redirect(config[config.env].base_url + 'inspirations/list');
                return;
            }
            render_data.inspiration = inspiration;
            render_data.created = req.query.created || null;
            render_data.error_message = req.query.error_message || null;
            Promise.all([search_list_style(filter_style_ocassion), search_list_ocassion(filter_style_ocassion)])
                .then(function (data) {
                    render_data.inspiration.view_style = data[0];
                    render_data.inspiration.view_ocassion = data[1];
                    res.render('inspirations_edit.pug', render_data);
                })
                .catch(function (e) {
                    http_status.INTERNAL_SERVER_ERROR(res, e);
                })
        });
    },
    update: function (req, res, next) {
        console.log("Body ====> "+JSON.stringify(req.body));
        var filter = {};
        var validate_object_ids_array = [{
            id: req.params.inspiration_id,
            message: "Invalid Inspiration Id"
        }];
        var validate_object_ids = util.validate_object_ids(validate_object_ids_array);
        if (!validate_object_ids.is_validated) {
            res.redirect(config[config.env].base_url + 'inspirations/list');
            return;
        }

        async.waterfall([
            function (upload_photo_callback) {
                console.log("Hey")
                if (!req.file) {
                    upload_photo_callback(null, null);
                    return;
                }
                if (req.file) {
                    filter.url = req.file.filename + "" + req.file.path;
                    upload_photo_callback(null, filter.url);
                    return;
                }
            },
            function (upload_data, insert_inspiration_cb) {
                console.log(upload_data)
                if (upload_data) {
                    req.body.photo_url = upload_data.location;
                }

                filter._id =  new ObjectID(req.params.inspiration_id)
                if (req.body.ocassion && typeof (req.body.ocassion) === 'string') {
                    req.body.ocassion = [req.body.ocassion];
                }

                models.inspiration.update(filter, {
                    "$set": req.body
                }, function (err, update_response) {
                    if (err) {
                        insert_inspiration_cb(err);
                        return;
                    }
                    insert_inspiration_cb(null, update_response)
                });
            },
        ], function (err, update_response) {
            if (err) {
                http_status.INTERNAL_SERVER_ERROR(res, {
                    message: err.message
                });
                return;
            }
            http_status.OK(res, {
                message: "OK"
            });
        })
    },
    delete: function (req, res, next) {
        var validate_object_ids_array = [{
            id: req.body.inspiration_id,
            message: "Invalid Inspiration Id"
        }];
        var validate_object_ids = util.validate_object_ids(validate_object_ids_array);
        if (!validate_object_ids.is_validated) {
            http_status.BAD_REQUEST(res, {
                message: validate_object_ids.message
            });
            return;
        }
        var filter = {
            _id: new ObjectID(req.body.inspiration_id)
        }
        models.inspiration.remove(filter, function (err, inspiration) {

            if (err) {
                http_status.INTERNAL_SERVER_ERROR(res, {
                    message: err.message
                });
                return;
            }
            http_status.OK(res, {
                message: "OK"
            });
        })
    },
    get_style_list: function (req, res, next) {
        var filter = {};
        models.inspiration.get_style_list(filter, function (err, style) {
            if (err) {
                http_status.INTERNAL_SERVER_ERROR(res, {
                    message: err.message
                });
                return;
            }
            var final_response = {
                "status": 200,
                "message": "success",
                "data": style
            }
            http_status.OK(res, final_response);
        })
    },
    get_ocassion_list: function (req, res, next) {
        var filter = {};
        models.inspiration.get_ocassion_list(filter, function (err, ocassion) {
            if (err) {
                http_status.INTERNAL_SERVER_ERROR(res, {
                    message: err.message
                });
                return;
            }
            var final_response = {
                "status": 200,
                "message": "success",
                "data": ocassion
            };
            http_status.OK(res, final_response);
        })
    }
}

function search_inspiration(filter, req_body) {
    return new Promise(function (resolve, reject) {
        models.inspiration.search(filter, {}, req_body.start, req_body.length, function (err, inspiration) {
            if (err) {
                reject(err)
            };
            resolve(inspiration)
        })
    })

};

function get_inspiration_count(filter) {
    return new Promise(function (resolve, reject) {
        models.inspiration.count(filter, function (err, count) {
            if (err) {
                reject(err)
            }
            resolve(count)
        })
    })
};

function search_list_style(filter) {
    return new Promise(function (resolve, reject) {
        var styling = [];
        models.inspiration.get_style_list(filter, function (err, style) {
            if (err) {
                reject(err)
            }
            if (style) {
                style.forEach(function (item) {
                    styling.push(item.styling)
                })
                resolve(styling)
            }
        })
    })
};

function search_list_ocassion(filter) {
    return new Promise(function (resolve, reject) {
        var ocassion_list = [];
        models.inspiration.get_ocassion_list(filter, function (err, ocassion) {
            if (err) {
                reject(err)
            }
            if (ocassion) {
                ocassion.forEach(function (item) {
                    ocassion_list.push(item.ocassion)
                })
                resolve(ocassion_list)
            }
        })
    })
};