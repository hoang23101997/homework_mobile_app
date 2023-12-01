var fs = require("fs");
var path = require("path");

const database = path.join(__dirname, "db.json");

const readAllCallBack = (cb) => {
  fs.readFile(database, "utf8", (err, data) => {
    // callback
    if (err) {
      console.log(err);
      return;
    }
    cb(JSON.parse(data));
    console.log("readFile", JSON.parse(data));
  });
};

const readAllPromise = () => {
  return fs.promises
    .readFile(database, "utf8")
    .then((data) => {
      // console.log('readFile', JSON.parse(data)); // string => object
      return JSON.parse(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

const readAll = async () => {
  try {
    const data = await fs.promises.readFile(database, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.log("readAll", err);
  }
};
const writeData = (data) => {
  return fs.promises.writeFile(database, JSON.stringify(data, null, 4), "utf8");
};

const createNewUser = async (userData) => {
  const oldData = await readAll();
  const newData = [userData, ...oldData];
  await writeData(newData);
};
const updateUser = async (userId, dataUpdate) => {
  const oldData = await readAll();
  const newData = oldData.map((user) => {
    if (user.id === userId) {
      return {
        ...user,
        ...dataUpdate,
      };
    }
    return user;
  });

  await writeData(newData);
};

const deleteUser = async (userId) => {
  const oldData = await readAll();
  const newData = oldData.filter((user) => user.id !== userId);
  await writeData(newData);
};

const main = async () => {
  const data = await readAll();
  console.log("data return:", data);
  await deleteUser(2);
  const dataAfterDelete = await readAll();
  console.log("dataAfterDelete return:", dataAfterDelete);
};

module.exports = {
  readAll,
  createNewUser,
  updateUser,
  deleteUser,
};
