const Post = require('../models/Post');

const postController={}

postController.register = async(req,res,next)=>{
    res.send("post Register")
}

module.exports = postController