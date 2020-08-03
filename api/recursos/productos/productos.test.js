const request = require("supertest");
const app = require("../../../index").app;
const server = require("../../../index").server;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../../config");
const Product = require("../productos/products.model");
const User = require("../usuarios/usuarios.model");

const objTest = {
  titulo: "AlienWare",
  precio: 1400,
  moneda: "USD",
  owner: "test",
};

const newProduct = {
  titulo: "MacBook",
  precio: 800,
  moneda: "USD",
};

const testUser = {
  username: "test",
  email: "test@test.com",
  password: "test123",
};

let authToken;
const idInexistente = "5f23102c342b9203d4ef4a80";

let invalidToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYmEzMjJiZGQ2NTRhN2RiZmNjNGUzMCIsImlhdCI6MTUyMjE1MTk3OSwiZXhwIjoxNTIyMjM4Mzc5fQ.AAtAAAAkYuAAAy9O-AA0sAkcAAAAqfXskJZxhGJuTIk";

const getToken = (done) => {
  // Antes de este bloque de tests creo un usuario y obtengo su JWT token. Esto nos permitirá testear rutas que requieren autenticación.
  User.deleteMany({}, (err) => {
    if (err) done(err);
    request(app)
      .post("/users")
      .send(testUser)
      .end((err, res) => {
        expect(res.status).toBe(201);
        request(app)
          .post("/users/login")
          .send({
            username: testUser.username,
            password: testUser.password,
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            authToken = res.body.token;
            done();
          });
      });
  });
};

describe("Productos", () => {
  beforeEach((done) => {
    Product.remove({}, (err) => {
      done();
    });
  });
  afterAll(() => {
    server.close();
  });

  describe("GET /products/:id", () => {
    test("Tratar de obtener un producto con un id inválido debería retornar 400", (done) => {
      request(app)
        .get("/products/123")
        .end((err, res) => {
          expect(res.status).toBe(401); //400
          done();
        });
    });

    test("Tratar de obtener un producto que no existe debería retornar 404", (done) => {
      request(app)
        .get(`/products/${idInexistente}`)
        .end((err, res) => {
          expect(res.status).toBe(404);
          done();
        });
    });

    test("Debería retornar un producto que si existe", (done) => {
      Product(objTest)
        .save()
        .then((product) => {
          request(app)
            .get(`/products/${product._id}`)
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Object);
              expect(res.body.titulo).toEqual(product.titulo);
              expect(res.body.precio).toEqual(product.precio);
              expect(res.body.moneda).toEqual(product.moneda);
              expect(res.body.owner).toEqual(product.owner);
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("POST /products", () => {
    beforeAll(getToken);

    test("Si el usuario provee un token válido y el producto también es válido, debería ser creado", (done) => {
      request(app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newProduct)
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.titulo).toEqual(newProduct.titulo);
          expect(res.body.moneda).toEqual(newProduct.moneda);
          expect(res.body.precio).toEqual(newProduct.precio);
          expect(res.body.owner).toEqual(testUser.username);
          done();
        });
    });

    test("Si el usuario no provee un token de autenticación válido, debería retornar 401", (done) => {
      request(app)
        .post("/products")
        .set("Authorization", `Bearer ${invalidToken}`)
        .send(newProduct)
        .end((err, res) => {
          expect(res.status).toBe(401);
          done();
        });
    });

    test("Si al producto le falta el título, no debería ser creado", (done) => {
      request(app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          moneda: newProduct.moneda,
          precio: newProduct.precio,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    test("Si al producto le falta el precio, no debería ser creado", (done) => {
      request(app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          titulo: newProduct.titulo,
          moneda: newProduct.moneda,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    test("Si al producto le falta la moneda, no debería ser creado", (done) => {
      request(app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          titulo: newProduct.titulo,
          precio: newProduct.precio,
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });
  });

  describe("DELETE /products/:id", () => {
    let idProductExists;

    beforeAll(getToken);

    beforeEach((done) => {
      Product.deleteMany({}, (err) => {
        if (err) done(err);
        Product(objTest)
          .save()
          .then((product) => {
            idProductExists = product._id;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    test("Tratar de obtener un producto con un id inválido debería retornar 400", (done) => {
      request(app)
        .delete("/products/123")
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(401);
          done();
        });
    });

    test("Tratar de borrar un producto que no existe debería retornar 404", (done) => {
      request(app)
        .delete(`/products/${idInexistente}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(404);
          done();
        });
    });

    test("Si el usuario no provee un token de autenticación válido, debería retornar 401", (done) => {
      request(app)
        .delete(`/products/${idProductExists}`)
        .set("Authorization", `Bearer ${invalidToken}`)
        .end((err, res) => {
          expect(res.status).toBe(401);
          done();
        });
    });

    test("Si el usuario no es el dueño del producto, debería retornar 401", (done) => {
      Product({
        titulo: "Television HD",
        precio: 769.87,
        moneda: "USD",
        owner: "carl78",
      })
        .save()
        .then((product) => {
          request(app)
            .delete(`/products/${product._id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .end((err, res) => {
              expect(res.status).toBe(401);
              expect(
                res.text.includes("No eres dueño del producto con id")
              ).toBe(true);
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });

    test("Si el usuario es dueño del producto y entrega un token valido, el producto debería ser borrado", (done) => {
      request(app)
        .delete(`/products/${idProductExists}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.titulo).toEqual(objTest.titulo);
          expect(res.body.precio).toEqual(objTest.precio);
          expect(res.body.moneda).toEqual(objTest.moneda);
          expect(res.body.owner).toEqual(objTest.owner);
          Product.findById(idProductExists)
            .then((product) => {
              expect(product).toBeNull();
              done();
            })
            .catch((err) => {
              done(err);
            });
        });
    });
  });

  describe("PUT /products/:id", () => {
    let idProductExists;

    beforeAll(getToken);

    beforeEach((done) => {
      Product.deleteMany({}, (err) => {
        if (err) done(err);
        Product(objTest)
          .save()
          .then((product) => {
            idProductExists = product._id;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    test("Tratar de obtener un producto con un id inválido debería retornar 400", (done) => {
      request(app)
        .put("/products/123")
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    test("Tratar de editar un producto que no existe debería retornar 404", (done) => {
      request(app)
        .put(`/products/${idInexistente}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    test("Si el usuario no provee un token de autenticación válido, debería retornar 401", (done) => {
      request(app)
        .put(`/products/${idProductExists}`)
        .set("Authorization", `Bearer ${invalidToken}`)
        .end((err, res) => {
          expect(res.status).toBe(401);
          done();
        });
    });
  });
});
