const express=require("express");
const app=express();
require('dotenv').config();
const mongoose = require('mongoose');

const databaseUrl = process.env.DATABASE_URL;

mongoose.connect(databaseUrl);
  

const UserSchema=new mongoose.Schema({ // Defining Schema for mongoose
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});
const User=mongoose.model('User',UserSchema);

const Account = mongoose.model('Account', accountSchema);

module.exports={User, Account}