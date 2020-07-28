const request = require("supertest");
const User = require("./usuarios.model");
const app = require("../../../index").app;
const server = require("../../../index").server;

describe("Usuarios", () => {
  //Antes de cada test ejectuar este callback, para borrar la tabla de los usuarios
  beforeEach((done) => {
    User.remove({}, (err) => {
      done();
    });
  });

  //Ejecuta el callback despues que todos los test hayan sido ejecutados
  afterAll(() => {
    server.close();
  });

  describe("GET /users", () => {
    test("Si no hay usuarios, debería retornar un array vacio.", (done) => {
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
  });
});
