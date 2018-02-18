var express = require('express');
var router = express.Router();
var config = require('../configs/config.js');
var controllers = require('../controllers');
var acl = require('../helpers/acl_helper.js');
var bodyParser = require('body-parser');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config[config.env].upload_path)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage })


router.get('/login', controllers.login.login_view);

router.get('/', controllers.login.login_view);

router.post('/login', controllers.login.login);

router.get('/logout', controllers.login.logout);

router.get('/inspirations/add',acl,controllers.inspiration.add_view);

router.post('/inspirations/add',acl,upload.single('photo'),controllers.inspiration.add)

router.get('/inspirations/list',acl,controllers.inspiration.list);

router.post('/inspirations/list', acl, bodyParser.json(), controllers.inspiration.get_all);

router.get('/inspirations/edit/:inspiration_id',acl,controllers.inspiration.edit);

router.post('/inspirations/edit/:inspiration_id',acl,upload.single('photo'),controllers.inspiration.update);

router.get('/inspirations/style/',controllers.inspiration.get_all_by_style_occasion);

router.delete('/inspirations/delete',acl,bodyParser.json(),controllers.inspiration.delete);

router.get('/inspirations/styling_list',controllers.inspiration.get_style_list);

router.get('/inspirations/ocassion_list',controllers.inspiration.get_ocassion_list);

module.exports = router;


