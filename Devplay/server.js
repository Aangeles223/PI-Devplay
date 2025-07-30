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
      pais_id,
      direccion,
      genero_id,
      fecha_nacimiento,
    } = req.body;

    // Encripta la contraseña antes de guardar
    const hash = await bcrypt.hash(contraseña, 10);

    db.query(
      `INSERT INTO usuario 
        (nombre, correo, contraseña, avatar, fecha_creacion, status_id, telefono, pais_id, direccion, genero_id, fecha_nacimiento) 
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        correo,
        hash,
        null,
        status_id,
        telefono,
        pais_id,
        direccion,
        genero_id,
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

// RUTA PUT /usuario/:id
app.put("/usuario/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, pais_id, genero_id, direccion, fecha_nacimiento } =
    req.body;
  const sql = `
    UPDATE usuario
      SET nombre=?, telefono=?, pais_id=?, genero_id=?, direccion=?, fecha_nacimiento=?
    WHERE id=?`;
  db.query(
    sql,
    [nombre, telefono, pais_id, genero_id, direccion, fecha_nacimiento, id],
    (err) => {
      if (err) {
        console.error("Error actualizando usuario:", err);
        return res.status(500).json({ error: err.message });
      }
      // Vuelvo a traer TODO, incluyendo teléfono
      const fetchSql = `
        SELECT 
          u.id, u.nombre, u.correo, u.telefono, u.direccion,
          DATE_FORMAT(u.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
          p.id AS pais_id, p.nombre AS pais,
          g.id AS genero_id, g.nombre AS genero
        FROM usuario u
        JOIN paises p ON u.pais_id = p.id
        JOIN generos g ON u.genero_id = g.id
        WHERE u.id = ?`;
      db.query(fetchSql, [id], (err2, rows) => {
        if (err2) {
          console.error("Error tras UPDATE:", err2);
          return res.status(500).json({ error: err2.message });
        }
        res.json({ success: true, usuario: rows[0] });
      });
    }
  );
});

app.get("/usuario/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
  console.log("GET /usuario for:", email);
  const sql = `
    SELECT 
      u.id,
      u.nombre,
      u.correo,
      u.telefono,
      u.direccion,
      DATE_FORMAT(u.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
      p.id AS pais_id, p.nombre AS pais,
      g.id AS genero_id, g.nombre AS genero
    FROM usuario u
    JOIN paises p ON u.pais_id = p.id
    JOIN generos g ON u.genero_id = g.id
    WHERE u.correo = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error en SELECT usuario:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0] || {});
  });
});

// 1. GET paises
app.get("/paises", (req, res) => {
  db.query("SELECT id, nombre FROM paises ORDER BY nombre", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. GET generos
app.get("/generos", (req, res) => {
  db.query("SELECT id, nombre FROM generos ORDER BY nombre", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
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

// RUTA GET /apps
app.get("/apps", (req, res) => {
  // Cambia 'apps' por el nombre real de tu tabla
  db.query("SELECT * FROM app", (err, results) => {
    if (err) {
      console.error("Error al leer app:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Inicia el servidor
app.listen(3001, () => {
  console.log("API corriendo en http://localhost:3001");
});
