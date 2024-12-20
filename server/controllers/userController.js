const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const saltRounds = parseInt(process.env.SALT);

exports.createUser = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
        } = req.body;
        const usernameExist = await Users.findOne({ username });
        const emailExist = await Users.findOne({ email });
        if (usernameExist) {
            return res
                .status(200)
                .json({ status: false, message: "Username already taken" });
        } else if (emailExist) {
            return res
                .status(200)
                .json({ status: false, message:"Email address already taken" });
        } else {
            const hashedPassword =await bcrypt.hash(password, saltRounds);
            const newUser = await Users.create({
                username,
                email,
                password: hashedPassword,
            });
            const emailToken = jwt.sign(
                { _id: newUser._id.toString() },
                process.env.SECRET_JWT_KEY,
                {
                    expiresIn: "24h",
                }
            );
            sendEmailVerification(newUser.email, emailToken);
            res.status(201).json({
                status: true,
                message:"User created successfully, please verify your email address and sign in",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

exports.updateThisUser = async (req, res) => {
    try {
        const {
            username,
            displayName,
            email,
            profileImg,
            birthDate,
            about,
        } = req.body;
        const newUser = await Users.updateOne({
            username,
            displayName,
            email,
            profileImg,
            birthDate,
            about,
        });
        res.send(newUser);
    } catch (error) {
      console.error("Error editing User:", error);
      res.status(500).send("Internal Server Error");
    }
  };

async function sendEmailVerification(toEmail, emailToken) {
    try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.MYEMAIL,
            pass: process.env.MYEMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
    
        const mailOptions = {
          from:  process.env.MYEMAIL,
          to: toEmail,
          subject: 'Email Verification',
          text: `Hey, \nPlease click the following link to verify your email:\n ${process.env.SERVER_ADDRESS}/users/verify/${emailToken}`,
        };
    
        const info = await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('Email verification error:', error);
      }
    }

exports.Signin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({ username });
        if (!user) {
            return res.status(200).json({
                status: false,
                message: "Username or password incorrect",
            });
        } else if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { _id: user._id },
                process.env.SECRET_JWT_KEY,
                {
                    expiresIn: "24h",
                }
            );
            if (user.verified) {
                res.cookie("token", token, {
                    httpOnly: true,
                    maxAge: 864000,
                    sameSite: "strict",
                });
                res.status(200).send({
                    status: true,
                    message: "Logged in successfully",
                    user: {username: user.username, email: user.email, isAdmin: user.isAdmin},
                });
            } else {
                return res.status(200).json({
                    status: false,
                    message: "Please verify your email address",
                });
            }
        } else {
            return res.status(200).json({
                status: false,
                message: "Username or password incorrect",
            });
        }
    } catch (error) {
        console.error("Sign in error: " + error.message)
        res.status(500).json({
            status: false,
            message: "An error occurred during login",
            error: error,
        });
    }
};

exports.signout = async (req, res) => {
    try {
        res.cookie("token", "none", {
            httpOnly: true,
            maxAge: 1,
            sameSite: "strict",
        });
        res.status(200).send({
            status: true,
            message: "Signout successfully",
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: "An error occurred during signout",
            error: error,
        });
    }
};

exports.verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res
            .status(401)
            .json({success:false,type:'error', message: "Unauthorized: No token provided" });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_JWT_KEY);
        const user = await Users.findById(decodedToken._id);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({success:false,type:'error', message: "Unauthorized: Invalid token" });
    }
};
