const Webinar = require('../models/Webinar');

// Create Webinar
exports.createWebinar = async (req, res) => {
  const webinar = new Webinar(req.body);
  try {
    await webinar.save();
    res.status(201).json(webinar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Webinars
exports.getAllWebinars = async (req, res) => {
  const webinars = await Webinar.find();
  res.json(webinars);
};

// Update Webinar
exports.updateWebinar = async (req, res) => {
  const webinar = await Webinar.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(webinar);
};

// Delete Webinar
exports.deleteWebinar = async (req, res) => {
  await Webinar.findByIdAndDelete(req.params.id);
  res.json({ message: 'Webinar deleted' });
};
