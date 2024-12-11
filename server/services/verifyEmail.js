const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.verifyEmail = async (req, res) => {
    try {
        const verificationToken = req.params.token;
        const decoded = jwt.verify(
            verificationToken,
            process.env.SECRET_JWT_KEY
        );

        const userId = decoded._id;

        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            { verified: true },
            { new: true }
        );

        if (updatedUser) {
            return res.send(`
        <html>
          <head>
            <title>Email Verification Successful</title>
            <style>
              body {
                margin: 0;
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                text-align: center;
              }
              .container {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                padding: 20px 30px;
                max-width: 500px;
                width: 90%;
              }
              h1 {
                color: #4CAF50;
              }
              p {
                font-size: 16px;
                color: #555;
              }
              .btn {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                font-size: 16px;
                color: white;
                background-color: #4CAF50;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s ease;
              }
              .btn:hover {
                background-color: #45a049;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Thank You for Signing Up!</h1>
              <p>Your email has been successfully verified. You can now log in to Phone Selector.</p>
            </div>
          </body>
        </html>
      `);
        } else {
            return res.status(404).send(`
        <html>
          <head>
            <title>Email Verification Error</title>
            <style>
              body {
                margin: 0;
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                text-align: center;
              }
              .container {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                padding: 20px 30px;
                max-width: 500px;
                width: 90%;
              }
              h1 {
                color: #f44336;
              }
              p {
                font-size: 16px;
                color: #555;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Error</h1>
              <p>User not found or not updated.</p>
            </div>
          </body>
        </html>
      `);
        }
    } catch (error) {
        console.error("Error verifying user:", error);
        res.status(500).send(`
      <html>
        <head>
          <title>Internal Server Error</title>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              text-align: center;
            }
            .container {
              background-color: white;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              padding: 20px 30px;
              max-width: 500px;
              width: 90%;
            }
            h1 {
              color: #f44336;
            }
            p {
              font-size: 16px;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error</h1>
            <p>Internal Server Error. Please try again later.</p>
          </div>
        </body>
      </html>
    `);
    }
};
