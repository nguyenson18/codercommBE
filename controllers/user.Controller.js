const User = require('../models/User');
const { sendResponse, catchAsync, AppError} = require('../helpers/utils')
const bcrypt = require('bcryptjs')

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
  return res.send(req.userId)
})

userController.getCurrentUser = catchAsync(async(req,res,next)=>{
})

userController.getSingleUser = catchAsync(async(req,res,next)=>{
 
})

userController.UpdateProfile = catchAsync(async(req,res,next)=>{
})
module.exports = userController