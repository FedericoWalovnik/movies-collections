const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const auth = require('../../middleware/auth');

//@route    POST api/users
//@desc     Register user
//@acces    Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid Email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const user = new User(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await user.save();
      const token = await user.generateAuthToken();
      const { name, email } = user;
      res.status(201).send({ name, email, token });
    } catch (error) {
      console.log(error);
      res.status(400).json({ errors: 'Unable to register' });
    }
  }
);

//@route    POST api/users
//@desc     Login user
//@acces    Public
router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).json({ errors: 'Unable to login' });
  }
});

//@route    POST api/users/logout
//@desc     Logout from current account
//@acces    Private
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

//@route    POST api/users/logoutAll
//@desc     Logout from all the sessions
//@acces    Private
router.post('/logoutAll', auth, async(req,res) =>{
  try {
      req.user.tokens = []
      await req.user.save()

      res.send()
  } catch (err) {
      res.status(500).send()
  }
})

//@route    DELETE api/users
//@desc     Delete user logged
//@acces    Private
router.delete('/', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

//@route    GET api/users/me
//@desc     Get user logged
//@acces    Private
router.get('/me', auth, async (req, res) => {
  const { id, name, email, tokens, date } = req.user;
  res.send({ id, name, email, tokens, date });
});

//@route    PATCH api/users/me
//@desc     Update user info
//@acces    Private
router.patch('/me', auth, async(req,res)=>{
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password','avatar']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if(!isValidOperation){
      return res.status(400).json({ errors: 'Invalid update!' })
  }

  try {
      updates.forEach((update) => req.user[update] = req.body[update])
      await req.user.save()

      res.send(req.user)
  } catch (err) {
      res.status(400).json({ errors: 'Invalid update!' })
  }
})

module.exports = router;
