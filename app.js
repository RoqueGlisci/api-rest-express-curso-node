const debug = require("debug")("app:inicio");
// const dbDebug = require("debug")("app:db");
const express = require("express");
const config = require("config");
// const logger = require("./logger");
const morgan = require("morgan");
const Joi = require("@hapi/joi");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//Configuracion de entornos 
console.log("Aplicacion: " + config.get("nombre"));
console.log("BD server: " + config.get("configDB.host"));

//uso de middeware de tercero - Morgan

if (app.get("env") === "developmant") {
  app.use(morgan("tiny"));
  //console.log("Morgan habilitado...")  
  debug("Morgan esta habilitado");
}

//Trabajo con base de datos
debug("Conectando con la db...");

// app.use(logger);

// app.use(function (req, res, next) {
//   console.log("Autenticando....");
//   next();
// })


const usuarios = [
  { id: 1, nombre: "toto" },
  { id: 2, nombre: "pepe" },
  { id: 3, nombre: "manolo" },
];

app.get("/", (req, res) => {
  res.send("hola mundo");
});

app.get("/api/usuarios", (req, res) => {
  res.send(usuarios);
});

app.get("/api/usuarios/:id", (req, res) => {
  //res.send(req.query);
  let usuario = existeUsuario(req.params.id);
  if (!usuario) res.status(404).send("El usuario no se enconro");
  res.send(usuario);
});

app.post("/api/usuarios", (req, res) => {
  const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
  });
  const { error, value } = validarUsuario(req.body.nombre);
  if (!error) {
    const usuario = {
      id: usuarios.length + 1,
      nombre: value.nombre,
    };
    usuarios.push(usuario);
    res.send(usuario);
  } else {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
  }

  // if(!req.body.nombre || req.body.nombre.length <= 3){
  //     //400 bad request
  //     res.status(400).send("Debe ingresar nombre, que tenga 3 o mas letras ");
  //     return;
  // }
  // const usuario = {
  //     id: usuarios.length + 1,
  //     nombre: req.body.nombre
  // };
  // usuarios.push(usuario);
  // res.send(usuario);
});

app.put("/api/usuarios/:id", (req, res) => {
  //let usuario = usuarios.find((u) => u.id === parseInt(req.params.id));

  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("El usuario no se enconro");
    return;
  }

  const { error, value } = validarUsuario(req.body.nombre);

  if (error) {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
    return;
  }

  usuario.nombre = value.nombre;
  res.send(usuario);
});

app.delete("/api/usuarios/:id", (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("El usuario no se enconro");
    return;
  }

  const index = usuarios.indexOf(usuario);
  usuarios.splice(index, 1);

  res.send(usuarios);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}.....`);
});

function existeUsuario(id) {
  return usuarios.find((u) => u.id === parseInt(id));
}

function validarUsuario(nom) {
  const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
  });
  return schema.validate({ nombre: nom });
}
