const request = require("supertest");
const User = require("./usuarios.model");
const app = require("../../../index").app;
const server = require("../../../index").server;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../../config");
const mongoose = require("mongoose");

const testUsers = [
  {
    username: "test",
    email: "test@test.com",
    password: "test123",
  },
  {
    username: "test2",
    email: "test2@test.com",
    password: "test",
  },
  {
    username: "test3",
    email: "test3@test.com",
    password: "test",
  },
];

const userExistAndAttributesAreCorrect = (user, done) => {
  User.find({ username: user.username })
    .then((users) => {
      expect(users).toBeInstanceOf(Array);
      expect(users).toHaveLength(1);
      expect(users[0].username).toEqual(user.username);
      expect(users[0].email).toEqual(user.email);

      let iguales = bcrypt.compareSync(user.password, users[0].password);
      expect(iguales).toBeTruthy();
      done();
    })
    .catch((err) => {
      done(err);
    });
};

const userDoesNotExist = async (user, done) => {
  try {
    let users = await User.find().or([
      { username: user.username },
      { email: user.email },
    ]);
    expect(users).toHaveLength(0);
    done();
  } catch (err) {
    done(err);
  }
};

describe("Usuarios", () => {
  //Antes de cada test ejectuar este callback, para borrar la tabla de los usuarios
  beforeEach((done) => {
    User.deleteMany({}, (err) => {
      done();
    });
  });

  //Ejecuta el callback despues que todos los test hayan sido ejecutados
  afterAll(async () => {
    server.close();
    await mongoose.disconnect();
  });

  describe("GET /users", () => {
    test("Si no hay usuarios, debería retornar un arreglo vacio.", (done) => {
      //app es la aplicación de index.js.
      request(app)
        .get("/users")
        .end((err, res) => {
          expect(res.status).toBe(200); //Funcionó la llamada
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(0);
          done();
        });
    });

    test("Si existen usuarios, debería retonarlo en un arreglo", (done) => {
      Promise.all(testUsers.map((user) => new User(user).save())).then(
        (users) => {
          request(app)
            .get("/users")
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Array);
              expect(res.body).toHaveLength(3);
              done();
            });
        }
      );
    });
  });
  describe("POST /users", () => {
    test("Un usuario que cumple los requisitos debería ser creado", (done) => {
      request(app)
        .post("/users")
        .send(testUsers[0])
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(typeof res.text).toBe("string");
          // expect(res.text).toEqual("Usuario creado exitósamente.");
          userExistAndAttributesAreCorrect(testUsers[0], done);
        });
    });

    test("Crear un usuario con un username ya registrado debería fallar", (done) => {
      Promise.all(testUsers.map((user) => new User(user).save())).then(
        (users) => {
          request(app)
            .post("/users ")
            .send({
              username: "test",
              email: "testHelp@test.com",
              password: "test123",
            })
            .end((err, res) => {
              expect(res.status).toBe(409);
              expect(typeof res.text).toBe("string");
              done();
            });
        }
      );
    });

    test("Crear un usuario con un email ya registrado debería fallar", (done) => {
      Promise.all(testUsers.map((user) => new User(user).save())).then(
        (users) => {
          request(app)
            .post("/users")
            .send({
              username: "helpuser",
              email: "test@test.com",
              password: "test123",
            })
            .end((err, res) => {
              expect(res.status).toBe(409);
              expect(typeof res.text).toBe("string");
              done();
            });
        }
      );
    });

    test("Un usuario sin username no debería ser creado", (done) => {
      request(app)
        .post("/users")
        .send({
          email: "help@test.com",
          password: "password",
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Un usuario sin contraseña no debería ser creado", (done) => {
      request(app)
        .post("/users")
        .send({
          username: "mark",
          email: "mark@test.com",
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Un usuario sin email no debería ser creado", (done) => {
      request(app)
        .post("/users")
        .send({
          username: "prueba",
          password: "password",
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Un usuario con un email inválido no debería ser creado", (done) => {
      let user = {
        username: "help",
        email: "@gmail.com",
        password: "password",
      };
      request(app)
        .post("/users")
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          userDoesNotExist(user, done);
        });
    });

    test("Un usuario con un username con menos de 3 caracteres no debería ser creado", (done) => {
      let user = {
        username: "te",
        email: "test@test.com",
        password: "password",
      };
      request(app)
        .post("/users")
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          userDoesNotExist(user, done);
        });
    });

    test("Un usuario con un username con más de 30 caracteres no debería ser creado", (done) => {
      let user = {
        username: "test".repeat(10),
        email: "help@test.com",
        password: "test",
      };
      request(app)
        .post("/users")
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          userDoesNotExist(user, done);
        });
    });

    test("Un usuario cuya contraseña tenga menos de 6 caracteres no debería ser creado", (done) => {
      let user = {
        username: "test",
        email: "test@test.com",
        password: "test",
      };
      request(app)
        .post("/users")
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          userDoesNotExist(user, done);
        });
    });

    test("Un usuario cuya contraseña tenga más de 200 caracteres no debería ser creado", (done) => {
      let user = {
        username: "friend",
        email: "friend@gmail.com",
        password: "password".repeat(40),
      };
      request(app)
        .post("/users")
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          userDoesNotExist(user, done);
        });
    });

    test("El username y email de un usuario válido deben ser guardados en lowercase", (done) => {
      let user = {
        username: "TeST",
        email: "HelPTEST@TEST.com",
        password: "passwordpassword",
      };
      request(app)
        .post("/users")
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(typeof res.text).toBe("string");
          // expect(res.text).toEqual("Usuario creado exitósamente.");
          userExistAndAttributesAreCorrect(
            {
              username: user.username.toLowerCase(),
              email: user.email.toLowerCase(),
              password: user.password,
            },
            done
          );
        });
    });
  });

  describe("POST /login", () => {
    test("Login debería fallar para un request que no tiene username", (done) => {
      let bodyLogin = {
        password: "passwordpassword",
      };
      request(app)
        .post("/users/login")
        .send(bodyLogin)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Login debería fallar para un request que no tiene password", (done) => {
      let bodyLogin = {
        username: "usernamedev",
      };
      request(app)
        .post("/users/login")
        .send(bodyLogin)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Login debería fallar para un usuario que no esta registrado", (done) => {
      let bodyLogin = {
        username: "usernamedev",
        password: "passwordpassword",
      };
      request(app)
        .post("/users/login")
        .send(bodyLogin)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Login debería fallar para un usuario registrado que suministra una contraseña incorrecta", (done) => {
      let user = {
        username: "test",
        email: "test@test.com",
        password: "test123",
      };

      new User({
        username: user.username,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
      })
        .save()
        .then((newUser) => {
          request(app)
            .post("/users/login")
            .send({
              username: user.username,
              password: "pruebapass",
            })
            .end((err, res) => {
              expect(res.status).toBe(400);
              expect(typeof res.text).toBe("string");
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });

    test("Usuario registrado debería obtener un JWT token al hacer login con credenciales correctas", (done) => {
      let user = {
        username: "test",
        email: "test@test.com",
        password: "test123",
      };

      new User({
        username: user.username,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
      })
        .save()
        .then((newUser) => {
          request(app)
            .post("/users/login")
            .send({
              username: user.username,
              password: user.password,
            })
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.token).toEqual(
                jwt.sign({ id: newUser._id }, config.jwt.secret, {
                  expiresIn: config.jwt.expirationTime,
                })
              );
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });

    test("Al hacer login no debe importar la capitalización del username", (done) => {
      let user = {
        username: "test",
        email: "test@test.com",
        password: "test123",
      };

      new User({
        username: user.username,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
      })
        .save()
        .then((newUser) => {
          request(app)
            .post("/users/login")
            .send({
              username: "TeST",
              password: user.password,
            })
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.token).toEqual(
                jwt.sign({ id: newUser._id }, config.jwt.secret, {
                  expiresIn: config.jwt.expirationTime,
                })
              );
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
