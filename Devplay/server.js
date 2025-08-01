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
  const sql = `
    SELECT
      a.id_app       AS id,
      a.nombre       AS name,
      a.precio       AS price,
      NULL           AS rating,
      a.rango_edad   AS ageRating,
      a.peso         AS size,
      a.descripcion  AS description,
      ac.categorias_id AS categoryId,
      c.nombre     AS category,
      a.img1,
      a.img2,
      a.img3l      AS img3,   -- aquí estaba el typo
      a.icono,
      a.is_free      AS isFree,
      a.is_premium   AS isPremium,
      a.is_on_sale   AS isOnSale,
      a.is_multiplayer AS isMultiplayer,
      a.is_offline   AS isOffline,
      (SELECT numero_version FROM version_app WHERE id_app = a.id_app ORDER BY fecha_lanzamiento DESC LIMIT 1) AS version,
      (SELECT fecha_lanzamiento FROM version_app WHERE id_app = a.id_app ORDER BY fecha_lanzamiento DESC LIMIT 1) AS releaseDate,
      (SELECT enlace_apk FROM version_app WHERE id_app = a.id_app ORDER BY fecha_lanzamiento DESC LIMIT 1) AS apkUrl
    FROM app a
    LEFT JOIN app_categorias ac ON a.id_app = ac.app_id_app
    LEFT JOIN categorias c ON ac.categorias_id = c.id
    ORDER BY a.id_app
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const apps = rows.map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price,
      description: r.description,
      rating: r.rating,
      ageRating: r.ageRating,
      size: r.size,
      categoryId: r.categoryId,
      category: r.category,
      icon: r.icono
        ? `data:image/jpeg;base64,${r.icono.toString("base64")}`
        : null,
      screenshots: [
        r.img1 ? `data:image/jpeg;base64,${r.img1.toString("base64")}` : null,
        r.img2 ? `data:image/jpeg;base64,${r.img2.toString("base64")}` : null,
        r.img3 ? `data:image/jpeg;base64,${r.img3.toString("base64")}` : null,
      ],
      // Flags for frontend filtering: free if text contains 'gratis' or price numeric equals 0
      isFree: (() => {
        const priceText =
          r.price != null ? r.price.toString().trim().toLowerCase() : "";
        return priceText.includes("gratis") || parseFloat(priceText) === 0;
      })(),
      isPremium: (() => {
        const priceText =
          r.price != null ? r.price.toString().trim().toLowerCase() : "";
        // Anything not free is premium
        return !(priceText.includes("gratis") || parseFloat(priceText) === 0);
      })(),
      isOnSale: r.isOnSale,
      isMultiplayer: r.isMultiplayer,
      isOffline: r.isOffline,
      version: r.version,
      releaseDate: r.releaseDate,
      apkUrl: r.apkUrl,
    }));
    res.json(apps);
  });
});

// RUTA GET /secciones
app.get("/secciones", (req, res) => {
  const sql = `SELECT id_seccion AS id, nombre AS name, descripcion FROM seccion ORDER BY id_seccion`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// RUTA GET /secciones/:id/apps
app.get("/secciones/:id/apps", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      a.id_app AS id,
      a.nombre AS name,
      a.precio AS price,
      a.rango_edad AS ageRating,
      a.peso AS size,
      a.descripcion AS description,
      ac.categorias_id AS categoryId
    FROM app a
    JOIN app_seccion s ON s.id_app = a.id_app
    LEFT JOIN app_categorias ac ON ac.app_id = a.id_app
    WHERE s.id_seccion = ?
    ORDER BY s.prioridad
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// RUTA GET /categorias
app.get("/categorias", (req, res) => {
  const sql = `
    SELECT
      id            AS id,
      nombre        AS name
    FROM categorias
    ORDER BY nombre
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// RUTA GET /apps/:id/reviews
app.get("/apps/:id/reviews", (req, res) => {
  const appId = req.params.id;
  const sql = `
    SELECT
      v.id_valoracion AS id,
      u.nombre AS user,
      u.avatar AS avatar,
      v.puntuacion AS rating,
      v.comentario AS comment,
      DATE_FORMAT(v.fecha, '%Y-%m-%d') AS date
    FROM valoracion v
    JOIN usuario u ON v.usuario_id = u.id
    WHERE v.id_app = ?
    ORDER BY v.fecha DESC
  `;
  db.query(sql, [appId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// RUTA GET /descargas
app.get("/descargas", (req, res) => {
  const sql = `SELECT id_descarga, id_app, fecha, cantidad FROM descarga ORDER BY fecha DESC`;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// RUTA POST /descargas
app.post("/descargas", (req, res) => {
  const { id_app } = req.body;
  const fecha = new Date();
  const cantidad = 1;
  const sql = `INSERT INTO descarga (id_app, fecha, cantidad) VALUES (?, ?, ?)`;
  db.query(sql, [id_app, fecha, cantidad], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id_descarga: result.insertId });
  });
});

// RUTA DELETE /descargas/:id - eliminar descarga (uninstall)
app.delete("/descargas/:id", (req, res) => {
  const { id } = req.params;
  const sqlDel = `DELETE FROM descarga WHERE id_descarga = ?`;
  db.query(sqlDel, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// RUTA POST /apps/:id/reviews
app.post("/apps/:id/reviews", (req, res) => {
  const appId = req.params.id;
  const { usuario_id, puntuacion, comentario } = req.body;
  const sql = `
    INSERT INTO valoracion (id_app, usuario_id, puntuacion, comentario, fecha)
    VALUES (?, ?, ?, ?, NOW())
  `;
  db.query(sql, [appId, usuario_id, puntuacion, comentario], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, reviewId: result.insertId });
  });
});

// Inicia el servidor en todas las interfaces para permitir conexiones desde emuladores y dispositivos
app.listen(3001, "0.0.0.0", () => {
  console.log("API corriendo en http://0.0.0.0:3001 (todas las interfaces)");
});
