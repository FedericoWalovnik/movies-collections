const { request } = require('express');

const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true
  },
  avatar: {
    type: Buffer
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

//find a user by their email and password
UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login!');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error('Unable to login!');
  }

  return user;
};

UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user.id.toString() }, config.get('jwtSecret'));

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//Hash the plain password before saving
UserSchema.pre('save', async function (next) {
  const user = this; //actual user to be saved

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

module.exports = User = mongoose.model('user', UserSchema);
