const jwt = require("jsonwebtoken");
const User = require("../models/User");

//Middleware to protect routes
const protect = async (req,res,next)=>{
    try{
        let token = req.headers.authorization;

        if(token && token.startsWith("Bearer")){
            token = token.split(" ")[1]; //Exact token
            const decoded = jwt.verify(token,process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } else{
            res.status(401).json({message:"Not Authorized, no token"});
        }
    } catch(err){
        res.status(401).json({ message :"Token failed", error: err.message});
    }
};

module.exports = {protect};