const jwt=require('jsonwebtoken');module.exports=user=>jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1d'});
