// in controllers/conversationController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Get or create a conversation between two users
exports.getConversation = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Send a message and save it
exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { conversationId } = req.params;
        const senderId = req.user.id;

        const newMessage = new Message({
            conversationId,
            sender: senderId,
            text: message,
        });

        await newMessage.save();

        // Also update the lastMessage in the conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
                text: message,
                sender: senderId,
            },
        });
        
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get all messages for a conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .populate("sender", "fullName")
            .sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};