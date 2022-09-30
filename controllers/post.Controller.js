const Post = require('../models/Post');
const { sendResponse, catchAsync, AppError} = require('../helpers/utils')
const User = require('../models/User');
const Comment = require('../models/Comment');
const Friend = require('../models/Friend');


const postController={}

const calculatePostCount = async (userId)=>{
    const postCount = await Post.countDocuments({
        author:userId,
        isDelete:false
    })
    await User.findByIdAndUpdate(userId, {postCount})
}

postController.createNewPost = catchAsync(async (req, res, next) => {
    const currentUserId = req.userId
    const {content, image} = req.body

    let post = await Post.create({
        content, 
        image, 
        author: currentUserId
    })
    await calculatePostCount(currentUserId) // update postCount cua users
    post = await post.populate('author')
    

    sendResponse(res,200,true,post,null,"Create new post success")
})

postController.UpdateSinglePost = catchAsync(async(req, res, next)=>{
    // Get data from request
  const currentUserId = req.userId
  const postId = req.params.id
  //validation
  let post = await Post.findById(postId)

  if(!post){
    throw new AppError(400, "Post not found", "Update Post error")
  }
  if(!post.author.equals(currentUserId)){
    throw new AppError(400, "Only author can edit post", "Update Post error")
  }
 //Process
  const allows = [
    "content",
    "image",
  ]

  allows.forEach((field)=> {
    if(req.body[field] !== undefined){
      post[field] = req.body[field]
    }
  })

  await post.save()

//Response
  return sendResponse(res, 200, true, post, null, "Update post successful");
})


postController.getSinglePost = catchAsync(async(req, res, next)=>{
    // Get data from request
  const currentUserId = req.userId
  const postId = req.params.id
  //validation
  let post = await Post.findById(postId)
  if(!post){
    throw new AppError(401, "User not found", "Get single user error")
  }

 //Process
 post = post.toJSON()
 post.comment = await Comment.find({post:post._id}).populate('author')
//Response
  return sendResponse(res, 200, true, post, null, "Get single user successful");
})

postController.getPosts = catchAsync(async(req, res, next)=>{
    // Get data from request
  const currentUserId = req.userId
  const userId = req.params.userId
  let {page, limit} = {...req.query}
  //validation
  let user = await User.findById(userId)
  if(!user){
    throw new AppError(401, "User not found", "Get single user error")
  }

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  let userFriendIDs = await Friend.find({
    $or:[{from:userId}, {to:userId}],
    status:"accepted"
  })
  if(userFriendIDs && userFriendIDs.length>0){
    userFriendIDs = userFriendIDs.map((friend) => {
        if(friend.form._id.equals(userId)) return friend.to
        return friend.from
    })
  }else{
    userFriendIDs = []
  }
  userFriendIDs = [...userFriendIDs, userId]
  const filterConditions = [{isDeleted:false},{author:userFriendIDs}]
  const filterCriteria = filterConditions.length 
        ?{$and: filterConditions}
        : {};
  const count = await Post.countDocuments(filterCriteria)

  const totalPages = Math.ceil(count / limit)
  const offset = limit * (page-1)
 //Process
  let posts = await Post.find(filterCriteria)
    .sort({createAt: -1})
    .skip(offset)
    .limit(limit)
    .populate("author")

  
//Response
  return sendResponse(
    res,
    200,
    true,
    { posts, totalPages, count },
    null,
    "Get user successful"
  );
})

postController.deleteSinglePost = catchAsync(async(req, res, next)=>{
      // Get data from request
  const currentUserId = req.userId
  const postId = req.params.id
  //validation
 //Process

 const post = await Post.findByIdAndUpdate(
    {_id: postId, author:currentUserId},
    {isDeleted:true},
    {new:true}
    )
if(!post) {
    throw new AppError(400, "Post not found or user not authorized")
}
await calculatePostCount(currentUserId)
//Response
  return sendResponse(res, 200, true, post, null, "Delete post successful");
})

postController.getCommentOfPost = catchAsync(async(req, res, next)=>{
  const postId = req.params.id
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10

  const post = Post.findById(postId)
  if(!post)
  throw new AppError(400, "Post not found", "Get comments Error")

  const count = await Comment.countDocuments({post:postId})
  const totalPages = Math.ceil(count/limit)
  const offset = limit* (page-1)
  const comments = await Comment.find({post:postId})
    .sort({createAt: -1})
    .skip(offset)
    .limit(limit)
    .populate('author')
  

  sendResponse(res,200,true, {comments, totalPages, count}, "Get comments successful")
})
module.exports = postController