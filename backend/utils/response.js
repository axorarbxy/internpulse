exports.success=(res,message,data={})=>res.json({message,...data});exports.error=(res,status,message)=>res.status(status).json({message});
