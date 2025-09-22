const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: {
        type: String,
        enum: ['ACCOUNT_CREATED', 'PROFILE_UPDATED', 'EVENT_REGISTERED', 'MENTORSHIP_ACCEPTED', 'JOB_APPLIED', 'POST_CREATED'],
        required: true
    },
    details: {
        // We use a Mixed type to store different kinds of related data
        type: mongoose.Schema.Types.Mixed 
    },
}, { timestamps: true });

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
module.exports = Activity;