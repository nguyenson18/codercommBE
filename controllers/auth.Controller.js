const { catchAsync, AppError, sendResponse } = require('../helpers/utils');
const User = require('../models/User');
const bcrypt = require('bcryptjs')

const authController={}

authController.loginWithEmail =catchAsync(async(req,res,next)=>{
  // Get data from request
  let { email, password } = req.body;

  //validation
  const user = await User.findOne({email}, "+password")
  if(!user) throw new AppError(400, "Invalid Creadentials", "Login Error")
  
  //Process
  const isMatch = await bcrypt.compare(password, user.password)
  if(!isMatch) throw new AppError(400, "Wrong Password", "Login Error")
  const accessToken = await  user.generateToken()

  //Response
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Login success"
  );
})

module.exports = authController