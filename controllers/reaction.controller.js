const { default: mongoose } = require("mongoose");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const Reaction = require("../models/Reaction")

const reactionController ={}; 

reactionController.saveReaction = catchAsync(async(req, res, next) => {
    const  {targetId, targetType, emoji} = req.body;
    const currentUserId = req.userId;

    const targetObj = await mongoose.model(targetType).findById(targetId);
    if(!targetObj){
        throw new AppError(400, `${targetType} not found`, 'create action error')
    }

    let reaction = await Reaction.findOne({
        targetId, 
        targetType, 
        author: currentUserId,
    });
    
    if(!reaction) {
      reaction =  await Reaction.create({
            targetType, targetId, author: currentUserId, emoji
        })
    }else {
        if(reaction.emoji === emoji) {
            await reaction.delete()
        }else{
            reaction.emoji = emoji;
            await reaction.save()
        }
    }
    return sendResponse(res, 200, true, reaction, null, 'save reaction success')
})

module.exports = reactionController