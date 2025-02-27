const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/recipes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Recipe Schema
const RecipeSchema = new mongoose.Schema({
    title: String,
    ingredients: [String],
    instructions: String,
    imageUrl: String,
    category: String,
    prepTime: Number,
    servings: Number,
    author: String,
    dateAdded: { type: Date, default: Date.now },
    ratings: { type: Number, default: 0 },
    comments: [{ user: String, comment: String, date: { type: Date, default: Date.now } }],
    favorites: { type: Number, default: 0 }
});
const Recipe = mongoose.model('Recipe', RecipeSchema);

// Routes
app.get('/recipes', async (req, res) => {
    const recipes = await Recipe.find();
    res.json(recipes);
});

app.get('/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        res.json(recipe);
    } catch (err) {
        res.status(404).json({ message: 'Recipe not found' });
    }
});

app.post('/recipes', async (req, res) => {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.json(newRecipe);
});

app.put('/recipes/:id', async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRecipe);
    } catch (err) {
        res.status(400).json({ message: 'Error updating recipe' });
    }
});

app.delete('/recipes/:id', async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting recipe' });
    }
});

app.get('/recipes/category/:category', async (req, res) => {
    try {
        const recipes = await Recipe.find({ category: req.params.category });
        res.json(recipes);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching recipes' });
    }
});

app.get('/recipes/top-rated', async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ ratings: -1 }).limit(5);
        res.json(recipes);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching top-rated recipes' });
    }
});

app.post('/recipes/:id/comment', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        recipe.comments.push(req.body);
        await recipe.save();
        res.json(recipe);
    } catch (err) {
        res.status(400).json({ message: 'Error adding comment' });
    }
});

app.post('/recipes/:id/favorite', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        recipe.favorites += 1;
        await recipe.save();
        res.json(recipe);
    } catch (err) {
        res.status(400).json({ message: 'Error adding to favorites' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
