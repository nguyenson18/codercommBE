const Reaction = require('../models/Reaction');

const reactionController={}

reactionController.register = async(req,res,next)=>{
    res.send("reaction Register")
}

module.exports = reactionController