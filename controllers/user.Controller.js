const User = require('../models/User');
const { sendResponse, catchAsync, AppError} = require('../helpers/utils')
const bcrypt = require('bcryptjs');
const Friend = require('../models/Friend');

const userController={}

userController.register = catchAsync(async (req, res, next) => {
  // Get data from request
  let { name, email, password } = req.body;

  //validation
  let user = await User.findOne({ email });
  if (user)
    throw new AppError(400, "User already exists", "Registration Error");
  //Process
  const salt = await bcrypt.genSalt(10)
  password = await bcrypt.hash(password, salt)
  user = await User.create({ name, email, password });

  const accessToken = await user.generateToken()
  //Response
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create User success"
  );
});

userController.getUsers = catchAsync(async(req,res,next)=>{
  // Get data from request
  const currentUserId = req.userId
  let {page, limit, ...filter} = {...req.query}
  //validation
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [{isDelete:false}]
  if(filter.name){
    filterConditions.push({
      name:{$regex: filter.name, $options: 'i'}
    })
  }
  const filterCriteria = filterConditions.length 
        ?{$and: filterConditions}
        : {};
  const count = await User.countDocuments(filterCriteria)

  const totalPages = Math.ceil(count / limit)
  const offset = limit * (page-1)
 //Process
  let users = await User.find(filterCriteria)
    .sort({createAt: -1})
    .skip(offset)
    .limit(limit)

  const promises = users.map(async (user)=>{
    let temp = user.toJSON()
    temp.friendship = await Friend.findOne({
      $or:[
        {from:currentUserId, to: user._id},
        {from: user._id, to:currentUserId}
      ]
    })
    return temp
  })
  const userWithFriendShip = await Promise.all(promises)
  
//Response
  return sendResponse(
    res,
    200,
    true,
    { users: userWithFriendShip, totalPages, count },
    null,
    "Get user successful"
  );
})

userController.getCurrentUser = catchAsync(async(req,res,next)=>{
  // Get data from request
  const currentUserId = req.userId
  //validation
  const user = await User.findById(currentUserId)
 //Process
  if(!user){
    throw new AppError(401, "User not found", "Get current user error")
  }
//Response
  return sendResponse(res, 200, true, user, null, "Get user successful");
})

userController.getSingleUser = catchAsync(async(req,res,next)=>{
  // Get data from request
  const currentUserId = req.userId
  const userId = req.params.id
  //validation
  let user = await User.findById(userId)
  if(!user){
    throw new AppError(401, "User not found", "Get single user error")
  }

 //Process
  user = user.toJSON()
  user.friendship =  await Friend.findOne({
    $or:[
      {from: currentUserId, to: user._id},
      {from: user._id, to: currentUserId}
    ]
  })
//Response
  return sendResponse(res, 200, true, user, null, "Get single user successful");
  
})

userController.UpdateProfile = catchAsync(async(req,res,next)=>{
  // Get data from request
  const currentUserId = req.userId
  const userId = req.params.id
  //validation
  let user = await User.findById(userId)

  if(currentUserId !== userId){
    throw new AppError(400, "Permision required", "Update User Error")
  }

  if(!user){
    throw new AppError(400, "User not found", "Update user error")
  }
 //Process
  const allows = [
    "name",
    "avataUrl",
    "coverUrl",
    "aboutMe",
    "city",
    "country",
    "company",
    "jobTitle",
    "facebookLink",
    "instagramLink",
    "linkedinLink",
    "twitterLink",
  ]

  allows.forEach((field)=> {
    if(req.body[field] !== undefined){
      user[field] = req.body[field]
    }
  })

  await user.save()

//Response
  return sendResponse(res, 200, true, user, null, "Update user successful");
})

module.exports = userController