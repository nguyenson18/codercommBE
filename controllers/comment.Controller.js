const Comment = require('../models/Comment');
const Post = require('../models/Post')
const { sendResponse, catchAsync, AppError} = require('../helpers/utils')

const commentController={}
const calculateCommentCount = async (postId)=>{
    const commentCount = await Comment.countDocuments({
        post:postId,
        isDelete:false
    })
    await Post.findByIdAndUpdate(postId, {commentCount})
}

commentController.createNewComment =  catchAsync(async(req,res,next)=>{
    const currentUserId = req.userId
    const {content, postId} = req.body
    // check post exist 
    const post = Post.find(postId)
    if(!post) throw new AppError(400, "Post not found", "Create new comment error")

    
    // create new comment

    let comment = await Comment.create({
        author: currentUserId,
        post:postId,
        content
    })
    // update commentCount of the post
    await calculateCommentCount(postId)
    comment = await comment.populate('author')

    sendResponse(res,200,true,comment,null,"Create new comment successfuler")
})


commentController.updateSingleComment =  catchAsync(async(req,res,next)=>{
    const currentUserId = req.userId
    const commentId = req.params.id
    const {content} = req.body

    const comment = await Comment.findByIdAndUpdate(
        {_id: commentId, author:currentUserId},
        {content},
        {new:true}
    );
    if(!comment){
        throw new AppError(
            400,
            "Comment not found User not authorized",
            "Update Comment Error"
        )
    }

    return sendResponse(res,200,true,comment,null,"Update Success")
})

commentController.deleteSingleComment =  catchAsync(async(req,res,next)=>{
    const currentUserId = req.userId
    const commentId = req.params.id

    const comment = await Comment.findByIdAndDelete(
        {_id: commentId, author:currentUserId},
    );
    if(!comment){
        throw new AppError(
            400,
            "Comment not found User not authorized",
            "Delete Comment Error"
        )
    }
    await calculateCommentCount(comment.post)

    return sendResponse(res,200,true,comment,null,"Delete Success")
})

commentController.getSingleComment =  catchAsync(async(req,res,next)=>{
    const currentUserId = req.userId
    const commentId = req.params.id

    let comment= await Comment.findById(commentId)
    if(!comment){
        throw new AppError(400, "Comment not found", "Get single comment error")
    }

    return sendResponse(res,200,true,comment,null,"Get comment Success")
})

module.exports = commentController

