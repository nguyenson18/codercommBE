const express = require('express')
const router = express.Router();

/**
 * @route  POST /comments
 * @description Create a new comment
 * @body {content, postId}
 * @access Login required
 */

/**
 * @route  PUT /comments/:id
 * @description Update a comment
 * @access Login required
 */

/**
 * @route  DELETE /comments/:id
 * @description Delete a comment
 * @access Login required
 */

/**
 * @route  GET /comment/:id
 * @description Get details of a comment
 * @access Login required
 */
module.exports = router