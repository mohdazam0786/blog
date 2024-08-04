const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  }
});

const upload = multer({ storage });

// MongoDB connection
mongoose.connect('mongodb+srv://mohdazam0123sid:i1JqaDRiQVQ6PJ1R@cluster0.oequx5r.mongodb.net/?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

// Blog Post Schema
const blogPostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  image: String // Add image field
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Create Blog Post
app.post('/api/blogposts', upload.single('image'), async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const image = req.file ? req.file.path : null; // Get image path
    const blogPost = new BlogPost({ title, content, author, image });
    await blogPost.save();
    res.status(201).send(blogPost);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get All Blog Posts
app.get('/api/blogposts', async (req, res) => {
  try {
    const blogPosts = await BlogPost.find().populate('author', 'username');
    res.send(blogPosts);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Update Blog Post
app.put('/api/blogposts/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? req.file.path : null; // Get image path
    const blogPost = await BlogPost.findByIdAndUpdate(req.params.id, { title, content, image }, { new: true });
    if (!blogPost) return res.status(404).send('Blog post not found');
    res.send(blogPost);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Delete Blog Post
app.delete('/api/blogposts/:id', async (req, res) => {
  try {
    const blogPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!blogPost) return res.status(404).send('Blog post not found');
    res.send(blogPost);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
