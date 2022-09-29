const Friend = require('../models/Friend');

const friendController={}

friendController.register = async(req,res,next)=>{
    res.send("friend Register")
}

module.exports = friendController