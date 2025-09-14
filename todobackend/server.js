require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create Express instance
const app = express();
app.use(express.json());

// CORS setup
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ==================
// Todo Model
// ==================
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: Date,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  category: {
    type: String,
    default: "General",
  },
}, { timestamps: true });

const Todo = mongoose.model("Todo", todoSchema);

// ==================
// Routes
// ==================

// Create a new todo
app.post('/todos', async (req, res) => {
  try {
    const { title, description, dueDate, priority, category } = req.body;
    const newTodo = new Todo({ title, description, dueDate, priority, category });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all todos
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Update a todo
app.put('/todos/:id', async (req, res) => {
  try {
    const { title, description, completed, dueDate, priority, category } = req.body;
    const id = req.params.id;

    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, description, completed, dueDate, priority, category },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Todo.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ==================
// Server
// ==================
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
