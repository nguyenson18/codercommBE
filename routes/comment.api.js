const express = require('express');
const { body, param } = require('express-validator');
const authentication = require('../middlewares/authentication');
const validators = require('../middlewares/validators');
const commentController = require('../controllers/comment.Controller')
const router = express.Router();

/**
 * @route  POST /comments
 * @description Create a new comment
 * @body {content, postId}
 * @access Login required
 */
router.post('/',authentication.loginRequired,validators.validate([
    body('content', 'Missing content').exists().notEmpty(),
    body('postId',"Missing").exists().isString().custom(validators.checkObjectId)
]),
commentController.createNewComment
)

/**
 * @route  PUT /comments/:id
 * @description Update a comment
 * @access Login required
 */
 router.put('/:id',authentication.loginRequired,validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body('content',"Missing").exists().notEmpty()
]),
commentController.updateSingleComment
)

/**
 * @route  DELETE /comments/:id
 * @description Delete a comment
 * @access Login required
 */
 router.delete('/:id',authentication.loginRequired,validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId)
]),
commentController.deleteSingleComment
)

/**
 * @route  GET /comment/:id
 * @description Get details of a comment
 * @access Login required
 */
 router.get('/:id',authentication.loginRequired,validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId)
]),
commentController.getSingleComment
)

module.exports = router