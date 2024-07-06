const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./models/user');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/authentication', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Set up session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes to render the EJS templates
app.get('/', (req, res) => {
  res.render('index', { message: req.session.message });
  req.session.message = null;
});

app.get('/login', (req, res) => {
  res.render('login', { loginMessage: req.session.loginMessage, error: req.session.loginError });
  req.session.loginMessage = null;
  req.session.loginError = null;
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  
  if (user) {
    req.session.loginMessage = 'Login successful!';
    res.redirect('/');
  } else {
    req.session.loginError = 'Invalid username or password.';
    res.redirect('/login');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup', { signupMessage: req.session.signupMessage, error: req.session.signupError });
  req.session.signupMessage = null;
  req.session.signupError = null;
});

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ username });
  
  if (existingUser) {
    req.session.signupError = 'Username already exists.';
    res.redirect('/signup');
  } else {
    const user = new User({ username, email, password });
    await user.save();
    req.session.signupMessage = 'Signup successful!';
    res.redirect('/');
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
