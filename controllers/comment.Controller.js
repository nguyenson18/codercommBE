const Comment = require('../models/Comment');

const commentController={}

commentController.register = async(req,res,next)=>{
    res.send("comment Register")
}

module.exports = commentController