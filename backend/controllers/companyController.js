const Company=require('../models/Company');
exports.getProfile=async(req,res)=>{try{res.json({profile:await Company.getByUserId(req.user.id)||null});}catch(e){res.status(500).json({message:'Server error'});}};
exports.updateProfile=async(req,res)=>{try{if(!req.body.company_name)return res.status(400).json({message:'company_name is required'});res.json({message:'Company profile saved',profile:await Company.upsert(req.user.id,req.body)});}catch(e){res.status(500).json({message:'Server error'});}};
