import cloudinary from "../config/cloud.config.js";
import File from "../model/file.model.js"
import User from "../model/auth.model.js"


export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'file is required.'
            });
        }
        // Process the uploaded file here
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: 'filename is required.'
            });
        }
        // console.log(filename);
        
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "files",
                    resource_type: "auto"
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            )
            // console.log(stream);
            stream.end(req.file.buffer);
        });
        console.log(result);
        

        const file = await File.create({
            filename,
            fileURL:result.secure_url,
            createdBy:req.user._id
        })
        console.log(file);
        
        await User.findByIdAndUpdate(req.user._id ,
            {
            $push:{
                files:file._id
            }
            }
        )
      return res.status(201).json({
        success:true,
        msg:"file uploaded successfully.."
      })
    } catch (error) {
        console.log("Error uploading file:", error.message);
        res.status(500).json({ 
            success:false ,
            message: 'Internal server error.' });
    }
};