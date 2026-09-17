const Institution=require('../models/Institution');
exports.getProfile=async(req,res)=>{try{res.json({profile:await Institution.getByUserId(req.user.id)||null});}catch(e){res.status(500).json({message:'Server error'});}};
exports.updateProfile=async(req,res)=>{try{if(!req.body.institution_name)return res.status(400).json({message:'institution_name is required'});res.json({message:'Institution profile saved',profile:await Institution.upsert(req.user.id,req.body)});}catch(e){res.status(500).json({message:'Server error'});}};
