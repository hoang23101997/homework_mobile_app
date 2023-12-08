require('dotenv').config()
const express = require("express");
const cors = require("cors");
const UserModel = require("./models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose')
const bodyParser = require("body-parser");
const {
  readAll,
  createNewUser,
  updateUser,
  deleteUser,
  replaceUser,
  userLogin,
} = require("./fs");

//Connect to Database
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clusterfree.1dczfxj.mongodb.net/`;
const connectToDB = async () => {
	try {
		const connection = await mongoose.connect(url);
		console.log(`Database is connected at ${connection.connection.host}`);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};
// khởi tạo 1 app (instance của express)

const verifyUser = (req, res, next) => {
  try {
    if (!req?.headers?.authorization) {
      res.status(401).json({
        message: "unauthorization",
      });
      return;
    }
    console.log("req.headers.authorization", req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, PRIVATE_KEY);
    console.log("decoded", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

const app = express();
cors(app);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Get all users
app.get(
  "/users", // path
  async (req, res) => {
    const data = await readAll();
    res.status(401).json(data);
  }
);

//Get user by age
app.get("/user", async (req, res) => {
  const query = req.query;
  const userAge = parseInt(query.age, 10);
  const data = await readAll();
  const newData = data.filter((user) => user.age === userAge);
  res.json(newData);
});

//Create new user
app.post("/register", async (req, res) => {
  const { email, fullname, password } = req.body;
  if (!email || !fullname || !password) {
    return res.status(400).json({
      message: "Missing required key",
    });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User has already existed",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      email,
      fullname,
      password: hashedPassword,
    });

    newUser.save();

    res.status(201).json({
      message: "register user successfully",
    });
  } catch (error) {
    res.status(500).json(error);
    console.log(error)
  }
});




//Login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Missing required key",
    });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    console.log(existingUser)

    if (!existingUser) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatchPassword = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isMatchPassword) {
      return res.status(401).json({
        message: "invalid credentials",
      });
    }

    const jwtPayLoad = {
      email: existingUser.email,
      id: existingUser.id,
      fullname: existingUser.fullname,
    };
    const token = jwt.sign(jwtPayLoad, process.env.SECRET_KEY);

    res.json({
      user: jwtPayLoad,
      accessToken: token,
      message: "Login succesfully",
    });
  
 
  } catch (error) {
    res.status(500).json(error);
    console.log(error)
  }
})

// Update User by ID
app.put("/update/:userId", async (req, res) => {
  const body = req.body;
  console.log(body);

  const params = req.params;
  const userId = parseInt(params.userId);
  console.log(userId);

  await updateUser(userId, body);
  res.json({
    message: "update user success",
  });
});

// Delete user by ID
app.delete("/delete/:id", async (req, res) => {
  const userId = req.params.id;
  await deleteUser(userId);
  res.json({
    message: "delete user success",
  });
});
app.patch("/user", verifyUser, async (req, res) => {
  try {
    // xác thực người dùng bănq cách xác thực token
    // update
    console.log("req.user", req.user);
    const userId = req.user.id;
    const body = req.body;
    await updateUser(userId, body);
    res.json({
      message: "update user success",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
connectToDB()
app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log('cannot connect to server')
  }
  console.log(`Server is running at: ${process.env.PORT}`);
});
