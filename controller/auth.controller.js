import User from "../model/auth.model.js"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

export const registerUser =async(req,res)=>{
    try {
        const {name ,email,password ,domain, skills} =
        req.body
        if(!name || !email || !password){
            return res.status(400).json({
                success : false ,
                message : "All Fields are required"
            })
   
        }

        if(password.length<8){
            return res.status(400).json({
                success: false,
                message: "Password should be 8 characters"
            })
        }
        
        const existuser =await User.findOne({email})
        
        if(existuser){
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
       const hashedPassword =await bcrypt.hash(password ,10)

       const user = await User.create({
        name ,
        email ,
        password : hashedPassword ,
        domain ,
        skills
       })
       return res.status(201).json(
        {
            success : true ,
            message :"User Created Successfully" ,
            user

        }
       );


    } catch (e) {
        console.log(e.message)

        return res.status(500).json(
            {
                success: false,
                message: "Internal Server error",
                

            }
        );
    }
}

export const loginUser = async(req,res)=>{
    try {
        const {email,password}=req.body
        const user = await User.findOne({email}).select('+password')
        if(!user){
            return res.status(400).json({
                success: false,
                message: "Invalid user or password"
            })
        }

      const isMatch = await bcrypt.compare(password ,user.password)
      if(!isMatch){
          return res.status(400).json({
              success: false,
              message: "Invalid password"
          })
      }

      const token = jwt.sign({
        userID : user._id
      } ,process.env.JWT_SECRET)

        return res.status(200).json({
            success: true,
            message: "login successfully" ,
            user,
            token

        })

    } catch (e) {
       console.log(e.message)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
        
    }
}
