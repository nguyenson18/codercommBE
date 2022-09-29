const express = require('express')
const router = express.Router();
const userController = require('../controllers/user.Controller')
const {body, param} = require('express-validator');
const validators = require('../middlewares/validators');
const authentication = require('../middlewares/authentication');


/**
 * @route  POST /users
 * @description Register new user
 * @body {name, email, password}
 * @access Public
 */
    router.post(
      "/",
      validators.validate([
        body("name", "Invalid name").exists().notEmpty(),
        body("email", "Invalid email")
          .exists()
          .isEmail()
          .normalizeEmail({ gmail_remove_dots: false }),
        body("password", "Invalid").exists().notEmpty(),
      ]),
      userController.register
    );

/**
 * @route  GET /user?page=1&limit=10
 * @description Get user with pagination
 * @access Login required
 */
router.get("/",authentication.loginRequired,userController.getUsers)

/**
 * @route  GET /users/me
 * @description Get current user info
 * @access Login required
 */
router.get('/me',authentication.loginRequired, userController.getCurrentUser)

/**
 * @route  GET /users/:id
 * @description Get a user profile
 * @access Public
 */
router.get('/:id',authentication.loginRequired,  userController.getSingleUser)

/**
 * @route  PUT /users/:id
 * @description Update user profile
 * @body {name, avatarUrl, coverUrl, aboutMe, city, country, company, jobTilte, facebookLink, linkedinLink, twitterLink}
 * @access Login required
 */
router.put('/:id',authentication.loginRequired, userController.UpdateProfile)

module.exports = router