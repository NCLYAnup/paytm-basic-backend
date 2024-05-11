const express=require("express");
const router=express.Router();
require('dotenv').config();
const bcrypt = require('bcrypt');
const zod=require("zod");
const jwt=require("jsonwebtoken")
const {User, Account}=require("../db");
const { authMiddleware } = require('../middlewares/authMiddleware');

const JWT_SECRET=process.env.JWT_SECRET;
const saltRounds = 10;

const signupBody = zod.object({
    username: zod.string().email(),
	firstName: zod.string(),
	lastName: zod.string(),
	password: zod.string()
})

router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken"
        })
    }
    const password= req.body.password;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if(success){
    const user = await User.create({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })
    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })}
})

const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})

router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
   
    const user = await User.findOne({
        username: req.body.username
    });
    const password=req.body.password;

    if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
    }
    else{
        res.status(401).json({
            message: "Wrong Password"
        })
    }
       return;
    }

    
    res.status(411).json({
        message: "Error while logging in"
    })
})


const updateBody = zod.object({
	username: zod.string().email().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})
// for update the profile
router.get("/profile", authMiddleware, async (req, res) => {
        const user = await User.findOne({ _id: req.userId },{ password: 0 });
     
        // Respond with the user details
        res.json({ user });
        
    
});
router.put("/updateprofile",authMiddleware, async (req,res)=>{
    const userData = req.body.user; 
    const {success}=updateBody.safeParse(userData)
    if (!success) {
       
        res.status(411).json({
            message: "Error while updating information"
        })
    }
     else{
	 await User.updateOne({ _id: req.userId }, userData);
    
	
    res.json({
        message: "Updated successfully"
    })}
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter,
                "$options": "i"
            }
        }, {
            lastName: {
                "$regex": filter,
                "$options": "i"
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;