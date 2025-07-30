const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Configura la conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // <-- Cambia esto por tu usuario de MySQL
  password: "Master12$", // <-- Cambia esto por tu contraseña de MySQL
  database: "devplay",
});

// Prueba la conexión
db.connect((err) => {
  if (err) {
    console.error("Error de conexión:", err);
  } else {
    console.log("Conectado a MySQL");
  }
});

const bcrypt = require("bcrypt");

// REGISTRO de usuario
app.post("/register", async (req, res) => {
  try {
    const {
      nombre,
      correo,
      contraseña,
      status_id,
      telefono,
      pais,
      direccion,
      genero,
      fecha_nacimiento,
    } = req.body;

    // Encripta la contraseña antes de guardar
    const hash = await bcrypt.hash(contraseña, 10);

    db.query(
      `INSERT INTO usuario 
        (nombre, correo, contraseña, avatar, fecha_creacion, status_id, telefono, pais, direccion, genero, fecha_nacimiento) 
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        correo,
        hash,
        null,
        status_id,
        telefono,
        pais,
        direccion,
        genero,
        fecha_nacimiento,
      ],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "El correo ya está registrado" });
          }
          return res.status(500).json({ error: "Error en el registro" });
        }
        res.json({ success: true, userId: result.insertId });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.put("/usuario/avatar/:id", (req, res) => {
  const { avatar } = req.body;
  const { id } = req.params;
  db.query(
    "UPDATE usuario SET avatar = ? WHERE id = ?",
    [avatar, id],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Error al actualizar avatar" });
      res.json({ success: true });
    }
  );
});

app.get("/usuario/:correo", (req, res) => {
  const correo = req.params.correo;
  db.query(
    "SELECT * FROM usuario WHERE LOWER(correo) = LOWER(?)",
    [correo],
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Error al obtener usuario" });
      if (results.length === 0)
        return res.status(404).json({ error: "Usuario no encontrado" });
      res.json(results[0]);
    }
  );
});

// LOGIN de usuario
app.post("/login", (req, res) => {
  const { correo, contraseña } = req.body;
  if (!correo || !contraseña) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  db.query(
    "SELECT * FROM usuario WHERE correo = ?",
    [correo],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(401).json({ error: "Usuario no encontrado" });

      const usuario = results[0];
      const match = await bcrypt.compare(contraseña, usuario.contraseña);
      if (match) {
        res.json({
          success: true,
          usuario: usuario, // <-- devuelve el objeto completo
        });
      } else {
        res.status(401).json({ error: "Contraseña incorrecta" });
      }
    }
  );
});

//APPS
app.get("/apps", (req, res) => {
  db.query("SELECT * FROM apps", (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener apps" });
    res.json(results);
  });
});

// Inicia el servidor
app.listen(3001, () => {
  console.log("API corriendo en http://localhost:3001");
});
