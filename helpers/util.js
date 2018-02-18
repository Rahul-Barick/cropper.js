var config = require('../configs/config.js');
var ObjectID = require('mongodb').ObjectID;

module.exports = {
    validate_required_fields: function (required_array, validate_object) {
        for (var i = 0; i < required_array.length; i++) {
            if (!validate_object[required_array[i].name]) {
                return {is_validated: 0, message: required_array[i].message};
            }
        }
        return {is_validated: 1, message: "OK"};
    },
    validate_email_address: function (email) {
        var reg_exp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return reg_exp.test(email);
    },
    get_skip_number: function (page_number) {
        page_number--;
        var skip = page_number * config[config.env].api_record_limit;
        return skip;
    },
    get_object_ids_array: function (id_array) {
        var object_id_array = [];
        id_array.forEach(function (item) {
            object_id_array.push(new ObjectID(item));
        });
        return object_id_array;
    },
    get_object_id_string_array: function (id_array) {
        var object_id_string_array = [];
        id_array.forEach(function (item) {
            object_id_string_array.push(item.toString());
        });
        return object_id_string_array;
    },
    capitalize_first_letter: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    validate_object_ids: function (id_array) {
        for (i = 0; i < id_array.length; i++) {
            if (id_array[i].id && !ObjectID.isValid(id_array[i].id)) {
                return {is_validated: 0, message: id_array[i].message};
            }
        }
        return {is_validated: 1, message: "OK"};
    },
    validate_object_id_arrays: function (id_array) {
        for (i = 0; i < id_array.length; i++) {
            if (id_array[i].ids && id_array[i].ids.length) {
                for (j = 0; j < id_array[i].ids.length; j++) {
                    if (!ObjectID.isValid(id_array[i].ids[j])) {
                        return {is_validated: 0, message: id_array[i].message};
                    }
                }
            }
        }
        return {is_validated: 1, message: "OK"};
    },
    generate_otp: function () {
        return Math.floor(1000 + Math.random() * 9000);
    },
    remove_last_comma: function (value) {
        if (value && value.substring(value.length - 1) === ",") {
            value = value.substring(0, value.length - 1);
        }
        return value;
    }
};