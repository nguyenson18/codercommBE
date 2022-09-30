const {sendResponse, AppError} = require('../helpers/utils')
const {validationResult} = require('express-validator')
const { default: mongoose } = require('mongoose')

const validators = {}

validators.validate = (validationArray) => async(req,res,next) => {
    await Promise.all(validationArray.map((validation)=> validation.run(req)))

    const errors = validationResult(req)
    if(errors.isEmpty()) return next()

    const message = errors
        .array()
        .map((error)=> error.msg)
        .join(" & ")

    return sendResponse(res, 422, false, null, {message},"Validation Error")    
}

validators.checkObjectId = (paramId)=>{ 
     // kiểm tra phải id của mongoodb
    if(!mongoose.Types.ObjectId.isValid(paramId)){
        throw new Error("Invalid ObjcetId")
    }
    return true
}
module.exports = validators