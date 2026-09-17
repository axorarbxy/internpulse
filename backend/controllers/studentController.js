const Student=require('../models/Student');
exports.getProfile=async(req,res)=>{try{res.json({profile:await Student.getByUserId(req.user.id)||null});}catch(e){res.status(500).json({message:'Server error'});}};
exports.updateProfile=async(req,res)=>{try{res.json({message:'Student profile saved',profile:await Student.upsert(req.user.id,req.body)});}catch(e){res.status(500).json({message:'Server error'});}};
