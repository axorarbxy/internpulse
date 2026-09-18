const jwt=require('jsonwebtoken');
const jwtSecret=process.env.JWT_SECRET||'internpulse_jwt_secret';
module.exports=(req,res,next)=>{const h=req.headers.authorization;if(!h||!h.startsWith('Bearer '))return res.status(401).json({message:'Authentication required'});try{req.user=jwt.verify(h.split(' ')[1],jwtSecret);next();}catch(e){res.status(401).json({message:'Invalid or expired token'});}};
