const Admin = require('../models/Admins');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user=require('../models/User')

const mongoose = require('mongoose');



// Create Admin


exports.createAdmin = async (req, res) => {
 
  try{
 
  const userId = req.user.id;
  const permissionLevel=req.user.permissionLevel
  const existingAdmin = await Admin.findOne({ userId });

    if (existingAdmin) {
      // If admin exists, return a conflict response
      return res.status(409).json({ message: "Admin already exists for this user" });
    }
   
    const newAdmin = new Admin({
    userId,  // Use the userId from the token
    permissionLevel
    
    });
    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  const admins = await Admin.find();
  res.json(admins);
};

// Update Admin
exports.updateAdmin = async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(admin);
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  res.json({ message: 'Admin deleted' });
};
