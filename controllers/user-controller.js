
import { Thumbnail } from "../models/thumbnail-model.js";

// controller to get user all thumbnails
const getUsersThumbnails = async (req,res)=>{
    try {
        const {userId} = req.session;
        const thumbnails = await Thumbnail.find({userId}).sort({createdAt:-1})
        
        res.status(200).json({thumbnails})
    } catch (error) {
        res.status(500).json("Internal server error")
    }
}

// controller to get user thumbnail
const getThumbnailById = async (req,res)=>{
    try {
        const {userId} = req.session;
        const {id} = req.params
        const thumbnail = await Thumbnail.findOne({userId,_id:id})
        
        res.status(200).json({thumbnail})
    } catch (error) {
        res.status(500).json("Internal server error")
    }
}

export {getThumbnailById,getUsersThumbnails }