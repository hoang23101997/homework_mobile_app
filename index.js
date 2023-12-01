const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { readAll, createNewUser, updateUser, deleteUser } = require("./fs");

// khởi tạo 1 app (instance của express)
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
    res.json(data);
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
  const body = req.body;
  await createNewUser(body);
  res.json({
    message: "create user success",
  });
});

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

app.listen(3001, () => {
  console.log(`Example app listening on: ${3001}`);
});
