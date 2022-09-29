const express = require('express');
const authController = require('../controllers/auth.Controller');
const router = express.Router();
const validators = require('../middlewares/validators')
const {body} = require("express-validator")

/**
 * @route POST /auth/login
 * @description Log in with email and password
 * @body {email, password}
 * @access Public
 */

router.post('/login',
validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid").exists().notEmpty(),
  ]),
authController.loginWithEmail 
)
module.exports = router