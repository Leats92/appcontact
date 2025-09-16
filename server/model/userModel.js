const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: false,
            default: ''
        },
        lastName: {
            type: String,
            required: false,
            default: ''
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
)

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
