import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import staffModel from "../models/staffModel.js";
import { createBrowserHistory } from 'history';



const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "sahidsiddik0977@gmail.com",
    pass: "uhjr osxb cskd szzi",
  },
});



export const sendRegistrationConfirmationEmail = (email, password) => {
  const loginLink = "http://localhost:3000/login"; // Replace with your actual login page URL
  const mailOptions = {
    from: "Design_Studio",
    to: email,
    subject: "Your are Registered as Staff ",
    html: `
    <p>Welcome to Design Studio Family.</p>
      <p>Your password: ${password}</p>
      <p>Please <a href="${loginLink}">click here</a> to login.</p>
    `,
  };

  
  return transporter.sendMail(mailOptions);
};


export const createStaffMember = async (req, res) => {
  try {
    const { firstname, lastname, address, streetaddress, city, state, country, postal, email, password, phone } = req.body;

    // Check if any required field is missing or empty
    if (!firstname || !lastname || !address || !streetaddress || !city || !state || !country || !postal || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await staffModel.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      return res.status(500).json({
        success: false,
        message: "Error in hashing password",
      });
    }

    const user = await new staffModel({
      firstname,
      lastname,
      address,
      streetaddress,
      city,
      state,
      postal,
      country,
      email,
      phone,
      password: hashedPassword,
    }).save();


// Send registration confirmation email
await sendRegistrationConfirmationEmail(email, password);
    
  
    res.status(201).json({
      success: true,
      message: "Registered Successfully",
    });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};


// Login controller
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }
    // Check user
    const staff = await staffModel.findOne({ email });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Compare password
    const match = await comparePassword(password, staff.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    // Generate JWT token
    const token = JWT.sign({ _id: staff._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

  // Set token in response headers
  res.setHeader('Authorization', `Bearer ${token}`);

  // Update browser history to prevent going back to login page
  history.replace('/');


    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: staff._id,
        firstname: staff.firstname,
        lastname: staff.lastname,
        email: staff.email,
        // Add other user properties as needed
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Protected route test controller
export const testController = (req, res) => {
  res.send("Protected Route");
};

// Get all staff members
export const getAllStaffMembers = async (req, res) => {
  try {
    const staffMembers = await saffModel.find();
    res.status(200).json({ success: true, data: staffMembers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get staff member by ID
export const getStaffMemberById = async (req, res) => {
  try {
    const staffMember = await staffModel.findById(req.params.id);
    if (!staffMember) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }
    res.status(200).json({ success: true, data: staffMember });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Delete staff member by ID
export const deleteStaffMemberById = async (req, res) => {
  try {
    await staffModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Staff member deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


//--------------------------------------------------------------------------------profile update


export const updateProfileController = async (req, res) => {
  try {
    const { firstname, lastname, password, address, streetaddress, state, city, postal, country, phone } = req.body;
    const userId = req.user?._id;
    const user = await staffModel.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Validate incoming data (similar to your existing validation logic)

    // Update user properties with the new values
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.password = password ? await hashPassword(password) : user.password;
    user.address = address || user.address;
    user.streetaddress = streetaddress || user.streetaddress;
    user.city = city || user.city;
    user.state = state || user.state;
    user.postal = postal || user.postal;
    user.country = country || user.country;
    user.phone = phone || user.phone;

    const updatedUser = await user.save();

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send({
      success: false,
      message: "Error While Updating Profile",
      error: error.message,
    });
  }
};
