import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import cors from 'cors';
import session from 'express-session';
import userModel from './models/userModel.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import categoryRoutes from "./routes/categoryRoute.js";
import designcategoryRoutes  from "./routes/designcategoryRoute.js"
import productRoutes from "./routes/productRoute.js";
import designRoutes from "./routes/designRoute.js"
import imageRoutes from "./routes/imageRoute.js"
import staffRoutes from './routes/staffRoute.js'
import bothRoutes from "./routes/bothRoute.js"
//import Payment from     "./routes/payment.js";
import Design from "./models/designModel.js"
import appointments from './models/appoinmentModel.js';
import Appointment from "./models/appoinmentModel.js";
import staffModel from './models/staffModel.js';
import appoinmentModel from './models/appoinmentModel.js';
import { isAdmin, requireSignIn } from "./middlewares/authMiddleware.js";

const router = express.Router();
const app = express();



app.use(
  session({
    secret: 'qwerty!@@@@####HHG',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/categorydesign", designcategoryRoutes)
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/design", designRoutes);
app.use("/api/v1/image", imageRoutes);
app.use("/api/v1/both", bothRoutes);

//app.use("/api/v1/payment", Payment);

app.get('/', (req, res) => {
  res.send('<h1>Welcome to MERN stack project</h1>');
});

app.get('/users', async (req, res) => {
  try {
    const users = await userModel.find({ role: '0' });

    console.log('Filtered Users:', users); 

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'sahidsiddik0977@gmail.com', // Replace with your Gmail email address
    pass: 'uhjr osxb cskd szzi', // Replace with your Gmail password
  },
});

// Function to send an email
function sendEmail({ recipient_email, OTP }) {
  return new Promise((resolve, reject) => {
    const mail_configs = {
      from: 'Design_Studio',
      to: recipient_email,
      subject: 'Design_Studio',
      text: `The code to create a new password for the design website is ${OTP}`,
    };
    transporter.sendMail(mail_configs, (error, info) => {
      if (error) {
        console.log(error);
        return reject({ message: 'An error has occurred' });
      }
      return resolve({ message: 'Email sent successfully' });
    });
  });
}

app.post('/send_recovery_email', (req, res) => {
  sendEmail(req.body)
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});

app.post('/update-password', async (req, res) => {
  const { newPassword } = req.body;

  // Fetch and update the user's password (assuming you have a user model)
  try {
    const user = await userModel.findOne({ /* specify your query criteria here */ });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's password by hashing it
    const saltRounds = 10; // Adjust the number of salt rounds as needed
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;

    // Save the updated user
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.put('/users/:userId/activate', async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle the user's "active" status
    user.active = !user.active;
    await user.save();

    res.json({ message: 'User activation status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Define endpoint to handle fetching subcategories based on clicked category
app.get('/api/subcategories/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Find subcategories associated with the category
    const subcategories = await Subcategory.find({ parentCategorydesign: categoryId });

    res.json(subcategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




//----------Appointment section----------//
app.post('/api/appointment', async (req, res) => {
  const { staffId, date, slots } = req.body;

  // Validate if staffId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    return res.status(400).json({ message: "Invalid staff ID." });
  }

  try {
    // Check if staffId corresponds to an existing staff member
    const staffExists = await staffModel.findById(staffId);
    if (!staffExists) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    // Check if there is any booked appointment for the same date
    const existingBookedAppointment = await appointments.findOne({
      staffId,
      date,
      'slots.isBooked': true,
    });
    if (existingBookedAppointment) {
      return res.status(400).json({ message: "A booked appointment already exists for this date." });
    }

    // Check if the appointment already exists for the given staffId and date
    const existingAppointment = await appointments.findOne({ staffId, date });
    if (existingAppointment) {
      // Check if any slot in the existing appointment is already booked
      const isAnySlotBooked = existingAppointment.slots.some(slot => slot.isBooked);
      if (isAnySlotBooked) {
        return res.status(400).json({ message: "Cannot create a new appointment with booked slots." });
      }
    }

    // If staff exists and no booked appointment exists for this date, create the appointment
    const newAppointment = new appointments({ staffId, date, slots });
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.put('/api/appointment/:appointmentId/reschedule', async (req, res) => {
  const { appointmentId } = req.params;
  const { date, slots } = req.body;

  if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid appointment ID' });
  }

  try {
    // Find the appointment
    const appointment = await appointments.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update date and slots
    appointment.date = date;
    appointment.slots = slots;

    // Save the updated appointment
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



app.get('/api/slots', async (req, res) => {
  const currentDate = new Date();

  try {
    const appointments = await Appointment.find({
      date: { $gte: currentDate }
    }).populate('slots.bookedBy', 'firstname lastname email phone');
    // Populate bookedBy field with user details

    // Extract and return both available and booked slots
    const allSlots = appointments.reduce((acc, appointment) => {
      appointment.slots.forEach(slot => {
        acc.push({
          appointmentId: appointment._id,
          slotId: slot._id,
          date: appointment.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: slot.isBooked,
          bookedBy: slot.bookedBy
        });
      });
      return acc;
    }, []);

    res.json(allSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




app.post("/api/book", requireSignIn, isAdmin, async (req, res) => {
  const { appointmentId, slotId, recipient_email } = req.body; // Receive recipient email

  try {
    const appointment = await appoinmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Find if the user has already booked a slot on the same day
    const alreadyBooked = appointment.slots.some(slot => 
      slot.isBooked && slot.bookedBy.toString() === req.user._id.toString()
    );

    if (alreadyBooked) {
      return res.status(400).json({ message: "You can only book one slot per day." });
    }

    const slot = appointment.slots.find((slot) => slot._id.toString() === slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: "This slot is already booked." });
    }

    // Generate a unique video conference link
    const conferenceLink = `https://www.zoom.com/${uuidv4()}`;

    // Mark the slot as booked and update with conference link
    slot.isBooked = true;
    slot.bookedBy = req.user._id; // Update with the booked user's ID
    slot.conferenceLink = conferenceLink;

    // Update appointment with the booked slot
    await appointment.save();

    // Send email to booked user
    const mailConfigs = {
      from: 'sahidsiddik0977@gmail.com', // Sender email address
      to: recipient_email, // Use recipient email received from frontend
      subject: 'Slot Booking Confirmation From Design Studio',
      html: `
        <div style="background-color: #ecfd00; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
          <p style="color: #333; font-size: 16px;">Dear User,</p>
          <p style="color: #333; font-size: 16px;">Your slot has been booked successfully.</p>
          <p style="color: #333; font-size: 16px;">Slot Details:</p>
          <ul style="color: #333; font-size: 16px;">
            <li>Date: ${appointment.date}</li>
            <li>Start Time: ${slot.startTime}</li>
            <li>End Time: ${slot.endTime}</li>
            <li>Conference Link: <a href="${conferenceLink}">${conferenceLink}</a></li>
          </ul>
          <p style="color: #333; font-size: 16px;">Thank you for booking with us!</p>
        </div>
      `,
    };

transporter.sendMail(mailConfigs)
  .then((info) => {
    console.log('Email sent: ' + info.response);
    res.status(201).json({ message: "Slot booked successfully." });
  })
  .catch((error) => {
    console.log(error);
    res.status(500).json({ message: 'Failed to send email.' });
  });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






//----------------------------------------------------------//



// Endpoint to get designs by category
app.get('/api/v1/design/by-category/:categoryId', async (req, res) => {
  try {
    const designs = await Design.find({ category: req.params.categoryId });
    res.json({ success: true, designs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to get designs by subcategory
app.get('/api/v1/design/by-subcategory/:subcategoryId', async (req, res) => {
  try {
    const designs = await Design.find({ subcategory: req.params.subcategoryId });
    res.json({ success: true, designs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




dotenv.config();
connectDB();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgCyan);
});
