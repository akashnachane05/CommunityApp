const Activity = require('../models/Activity');

const recordActivity = async (userId, activityType, details = {}) => {
    try {
        const activity = new Activity({ user: userId, activityType, details });
        await activity.save();
    } catch (error) {
        console.error('Failed to record activity:', error);
    }
};

module.exports = recordActivity;