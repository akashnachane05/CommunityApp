const Post = require('../models/Post');
const User = require('../models/User'); // Ensure User is imported
const Sentiment = require('sentiment');

const sentiment = new Sentiment();

const isContentInappropriate = (text) => {
    const result = sentiment.analyze(text);
    console.log(`Analyzing: "${text}". Comparative Score: ${result.comparative}`);
    return result.comparative < -0.1;
};

// --- Helper function to record a violation ---
const recordViolation = async (userId, blockedContent) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $push: {
                violations: {
                    content: blockedContent,
                    timestamp: new Date()
                }
            }
        });
    } catch (error) {
        console.error("Failed to record violation:", error);
    }
};


// @desc    Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'fullName role')
      .populate({
        path: 'comments.author',
        select: 'fullName'
      })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (isContentInappropriate(title) || isContentInappropriate(content)) {
        await recordViolation(req.user.id, `Title: "${title}", Content: "${content}"`);
        return res.status(400).json({ message: "Your post's tone is overly negative and cannot be published." });
    }

    const newPost = new Post({ title, content, category, author: req.user.id });
    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (isContentInappropriate(content)) {
        await recordViolation(req.user.id, `Comment: "${content}"`);
        return res.status(400).json({ message: "Your comment's tone is overly negative and cannot be published." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.unshift({ author: req.user.id, content: content });
    await post.save();
    await post.populate({ path: 'comments.author', select: 'fullName' });
      
    res.status(201).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a comment from a post
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = post.comments.find((c) => c.id === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    post.comments = post.comments.filter(({ id }) => id !== req.params.commentId);
    await post.save();
    await post.populate({ path: 'comments.author', select: 'fullName' });
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like or unlike a post
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id.trim();
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.some(like => like.equals(req.user.id))) {
      post.likes = post.likes.filter(like => !like.equals(req.user.id));
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin delete any post
exports.adminDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    await post.deleteOne();
    res.json({ message: 'Post removed by admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin delete any comment
exports.adminDeleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const comment = post.comments.find(c => c.id === req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        post.comments = post.comments.filter(({ id }) => id !== req.params.commentId);
        await post.save();
        res.json({ message: 'Comment removed by admin' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};