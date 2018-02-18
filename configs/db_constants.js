function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("REVIEWS", "reviews");

define("DASHBOARD_USERS", "dashboard_users");

define("INSPIRATION","inspirations");

define("STYLE","style_list");

define("OCASSION","ocassion_list");