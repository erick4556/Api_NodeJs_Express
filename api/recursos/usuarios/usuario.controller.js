const User = require("./usuarios.model");

const getUsers = () => {
  return User.find({});
};

const createUser = (user, hashedPassword) => {
  return new User({ ...user, password: hashedPassword }).save();
};

const userExists = (username, email) => {
  return new Promise((resolve, reject) => {
    User.find()
      .or([{ username: username }, { email: email }])
      .then((users) => {
        resolve(users.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  getUsers,
  createUser,
  userExists,
};
