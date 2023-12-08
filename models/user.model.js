const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  }
});
const UserModel = mongoose.model("Users", UserSchema);
module.exports = UserModel
