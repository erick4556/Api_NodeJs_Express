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

//Permite buscar mediante el id o username
const getUser = ({ id, username }) => {
  if (id) return User.findById(id);
  if (username) return User.findOne({ username });

  throw new Error(
    "Función par obtener usuario del controller fue llamada sin especificar el id o username."
  ); //Mando un error para que el catch lo maneje.
};

module.exports = {
  getUsers,
  createUser,
  userExists,
  getUser,
};
