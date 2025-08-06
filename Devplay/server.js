// server.js with full API routes and DB connection
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

// Configura la conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Master12$",
  database: "devplay",
});

// Prueba la conexión
db.connect((err) => {
  if (err) console.error("Error de conexión:", err);
  else console.log("Conectado a MySQL");
});

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

// LOGIN de usuario
app.post("/login", (req, res) => {
  const { correo, contraseña } = req.body;
  console.log("Intento de login:", { correo, contraseña: "***" });

  if (!correo || !contraseña) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // Debug: Verificar la estructura de la tabla
  db.query("DESCRIBE usuario", (err, desc) => {
    if (err) {
      console.error("Error describiendo tabla:", err);
    } else {
      console.log("Estructura de tabla usuario:", desc);
    }
  });

  // Debug: Ver todos los correos en la tabla
  db.query("SELECT id, correo FROM usuario LIMIT 5", (err, allUsers) => {
    if (err) {
      console.error("Error listando usuarios:", err);
    } else {
      console.log("Usuarios en DB:", allUsers);
    }
  });

  db.query(
    "SELECT * FROM usuario WHERE correo = ?",
    [correo],
    async (err, results) => {
      if (err) {
        console.error("Error en query:", err);
        return res.status(500).json({ error: err });
      }

      console.log("Resultados de búsqueda:", results.length);
      console.log("Query ejecutada con correo:", JSON.stringify(correo));

      if (results.length === 0) {
        console.log("Usuario no encontrado");
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      const usuario = results[0];
      console.log("Usuario encontrado:", {
        id: usuario.id,
        correo: usuario.correo,
      });

      try {
        const match = await bcrypt.compare(contraseña, usuario.contraseña);
        console.log("Comparación de contraseña:", match);

        if (match) {
          res.json({
            success: true,
            usuario: usuario,
            token: usuario.id.toString(), // Token simple usando el ID
          });
        } else {
          res.status(401).json({ error: "Contraseña incorrecta" });
        }
      } catch (bcryptError) {
        console.error("Error en bcrypt:", bcryptError);
        res.status(500).json({ error: "Error de autenticación" });
      }
    }
  );
});

// Obtener usuario actual
app.get("/usuario/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  // Por simplicidad, el token será el ID del usuario
  // En producción deberías usar JWT real
  const userId = token;

  db.query(
    "SELECT id, nombre, correo, telefono, pais_id, genero_id, direccion, fecha_nacimiento FROM usuario WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(404).json({ error: "Usuario no encontrado" });

      res.json(results[0]);
    }
  );
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

// Obtener usuario por correo
app.get("/usuario/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email);
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
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
});

// Listar todos los usuarios
app.get("/usuarios", (req, res) => {
  console.log("GET /usuarios");
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
    ORDER BY u.id
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Paises y generos
app.get("/paises", (req, res) => {
  db.query("SELECT id, nombre FROM paises ORDER BY nombre", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get("/generos", (req, res) => {
  db.query("SELECT id, nombre FROM generos ORDER BY nombre", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Apps
app.get("/apps", (req, res) => {
  const sql = `SELECT a.id_app AS id, a.nombre AS name, a.precio AS price, NULL AS rating, a.rango_edad AS ageRating, a.peso AS size, a.descripcion AS description, ac.categorias_id AS categoryId, c.nombre AS category, a.img1, a.img2, a.img3l AS img3, a.icono, a.is_free AS isFree, a.is_premium AS isPremium, a.is_on_sale AS isOnSale, a.is_multiplayer AS isMultiplayer, a.is_offline AS isOffline, (SELECT numero_version FROM version_app WHERE id_app = a.id_app ORDER BY fecha_lanzamiento DESC LIMIT 1) AS version, (SELECT fecha_lanzamiento FROM version_app WHERE id_app = a.id_app ORDER BY fecha_lanzamiento DESC LIMIT 1) AS releaseDate, (SELECT enlace_apk FROM version_app WHERE id_app = a.id_app ORDER BY fecha_lanzamiento DESC LIMIT 1) AS apkUrl FROM app a LEFT JOIN app_categorias ac ON a.id_app = ac.app_id_app LEFT JOIN categorias c ON ac.categorias_id = c.id ORDER BY a.id_app`;
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
      isFree: (() => {
        const priceText =
          r.price != null ? r.price.toString().trim().toLowerCase() : "";
        return priceText.includes("gratis") || parseFloat(priceText) === 0;
      })(),
      isPremium: (() => {
        const priceText =
          r.price != null ? r.price.toString().trim().toLowerCase() : "";
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

// Secciones y apps por seccion
app.get("/secciones", (req, res) => {
  db.query(
    "SELECT id_seccion AS id, nombre AS name, descripcion FROM seccion ORDER BY id_seccion",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});
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
      ac.categorias_id AS categoryId,
      ROUND(AVG(v.puntuacion),1) AS rating
    FROM app a
    JOIN app_seccion s ON s.id_app = a.id_app
    LEFT JOIN app_categorias ac ON ac.app_id_app = a.id_app
    LEFT JOIN valoracion v ON v.id_app = a.id_app
    WHERE s.id_seccion = ?
    GROUP BY a.id_app, a.nombre, a.precio, a.rango_edad, a.peso, a.descripcion, ac.categorias_id
    ORDER BY a.id_app
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Categorias
app.get("/categorias", (req, res) => {
  db.query(
    "SELECT id AS id, nombre AS name FROM categorias ORDER BY nombre",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Reviews de apps
app.get("/apps/:id/reviews", (req, res) => {
  const appId = req.params.id;
  const sql = `SELECT v.id_valoracion AS id, u.nombre AS user, u.avatar AS avatar, v.puntuacion AS rating, v.comentario AS comment, DATE_FORMAT(v.fecha, '%Y-%m-%d') AS date FROM valoracion v JOIN usuario u ON v.usuario_id = u.id WHERE v.id_app = ? ORDER BY v.fecha DESC`;
  db.query(sql, [appId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Descargas
app.get("/descargas", (req, res) => {
  db.query(
    "SELECT id_descarga, id_app, fecha, cantidad, instalada, fecha_install FROM descarga ORDER BY fecha DESC",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});
app.post("/descargas", (req, res) => {
  const { id_app, usuario_id } = req.body;

  console.log("Datos recibidos:", { id_app, usuario_id });

  if (!id_app || !usuario_id) {
    return res
      .status(400)
      .json({ error: "Faltan datos requeridos: id_app y usuario_id" });
  }

  const fecha = new Date();
  const cantidad = 1;

  // Verificar si ya existe en mis_apps (apps instaladas por el usuario)
  db.query(
    "SELECT id FROM mis_apps WHERE app_id_app = ? AND usuario_id = ?",
    [id_app, usuario_id],
    (err, existing) => {
      if (err) {
        console.error("Error verificando app instalada:", err);
        return res.status(500).json({ error: err.message });
      }

      if (existing.length > 0) {
        console.log(
          "App ya instalada para usuario:",
          usuario_id,
          "app:",
          id_app
        );
        return res.json({
          success: true,
          message: "App ya instalada",
        });
      }

      // No existe, insertar directamente en mis_apps para propiedad
      db.query(
        "INSERT INTO mis_apps (app_id_app, usuario_id) VALUES (?, ?)",
        [id_app, usuario_id],
        (err2, result) => {
          if (err2) {
            console.error("Error en mis_apps:", err2);
            return res.status(500).json({ error: err2.message });
          } else {
            console.log("App agregada a mis_apps para usuario:", usuario_id);

            // Opcionalmente, actualizar estadísticas en descarga (sin restricción de usuario)
            const fechaSolo = new Date().toISOString().split("T")[0]; // Solo fecha, sin hora
            db.query(
              "INSERT INTO descarga (id_app, fecha, cantidad, instalada, fecha_install) VALUES (?, ?, 1, 1, NOW()) ON DUPLICATE KEY UPDATE cantidad = cantidad + 1",
              [id_app, fechaSolo],
              (err3) => {
                if (err3) {
                  console.log("Error opcional en estadísticas descarga:", err3);
                  // No fallar la operación por esto
                }
              }
            );

            res.json({
              success: true,
              id_descarga: result.insertId,
              message: "App instalada correctamente",
            });
          }
        }
      );
    }
  );
});
app.delete("/descargas/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM descarga WHERE id_descarga = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Desinstalar app (eliminar de mis_apps y descargas)
app.delete("/desinstalar/:usuario_id/:app_id", (req, res) => {
  const { usuario_id, app_id } = req.params;

  console.log("Desinstalando app:", app_id, "para usuario:", usuario_id);

  // Eliminar de mis_apps
  db.query(
    "DELETE FROM mis_apps WHERE usuario_id = ? AND app_id_app = ?",
    [usuario_id, app_id],
    (err1) => {
      if (err1) {
        console.error("Error eliminando de mis_apps:", err1);
        return res.status(500).json({ error: err1.message });
      }

      // Eliminar de descargas (solo por id_app ya que descarga no tiene usuario_id)
      db.query("DELETE FROM descarga WHERE id_app = ?", [app_id], (err2) => {
        if (err2) {
          console.error("Error eliminando de descarga:", err2);
          return res.status(500).json({ error: err2.message });
        }

        console.log("App desinstalada exitosamente");
        res.json({
          success: true,
          message: "App desinstalada correctamente",
        });
      });
    }
  );
});

// Crear review
app.post("/apps/:id/reviews", (req, res) => {
  const appId = req.params.id;
  const { usuario_id, puntuacion, comentario } = req.body;
  db.query(
    "INSERT INTO valoracion (id_app, usuario_id, puntuacion, comentario, fecha) VALUES (?, ?, ?, ?, NOW())",
    [appId, usuario_id, puntuacion, comentario],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, reviewId: result.insertId });
    }
  );
});
// Alias en español para reseñas (valoración)
app.get("/apps/:id/resenas", (req, res) => {
  const appId = req.params.id;
  const sql = `SELECT v.id_valoracion AS id, u.nombre AS user, u.avatar AS avatar, v.puntuacion AS rating, v.comentario AS comment, DATE_FORMAT(v.fecha, '%Y-%m-%d') AS date FROM valoracion v JOIN usuario u ON v.usuario_id = u.id WHERE v.id_app = ? ORDER BY v.fecha DESC`;
  db.query(sql, [appId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post("/apps/:id/resenas", (req, res) => {
  const appId = req.params.id;
  const { usuario_id, puntuacion, comentario } = req.body;
  db.query(
    "INSERT INTO valoracion (id_app, usuario_id, puntuacion, comentario, fecha) VALUES (?, ?, ?, ?, NOW())",
    [appId, usuario_id, puntuacion, comentario],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, reviewId: result.insertId });
    }
  );
});

// Notificaciones
app.get("/notificaciones", (req, res) => {
  const usuarioId = req.query.usuario_id;
  let sql =
    "SELECT id, descripcion, fecha_creacion, usuario_id, status_id FROM notificaciones";
  const params = [];
  if (usuarioId) {
    sql += " WHERE usuario_id = ?";
    params.push(usuarioId);
  }
  sql += " ORDER BY fecha_creacion DESC";
  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Mis Apps: get apps owned by user
// Registrar app adquirida en mis_apps
app.post("/mis_apps", (req, res) => {
  const { app_id_app, usuario_id } = req.body;
  if (!app_id_app || !usuario_id) {
    return res
      .status(400)
      .json({ error: "app_id_app y usuario_id son requeridos" });
  }
  // Evita duplicados con INSERT IGNORE
  db.query(
    "INSERT IGNORE INTO mis_apps (app_id_app, usuario_id) VALUES (?, ?)",
    [app_id_app, usuario_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: result.insertId });
    }
  );
});

app.get("/mis_apps", (req, res) => {
  const usuarioId = req.query.usuario_id;
  if (!usuarioId)
    return res.status(400).json({ error: "usuario_id is required" });
  const sql = `
    SELECT DISTINCT a.id_app AS id, a.id_app AS id_app, a.nombre AS name, a.precio AS price,
           a.img1 AS img1, a.img2 AS img2, a.icono AS icon, 
           c.nombre AS category, ? AS usuario_id
    FROM mis_apps m
    JOIN app a ON m.app_id_app = a.id_app
    LEFT JOIN app_categorias ac ON a.id_app = ac.app_id_app
    LEFT JOIN categorias c ON ac.categorias_id = c.id
    WHERE m.usuario_id = ?
    ORDER BY a.id_app DESC
  `;
  db.query(sql, [usuarioId, usuarioId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// Alias route: get mis_apps by path param
app.get("/mis_apps/:usuario_id", (req, res) => {
  const usuarioId = req.params.usuario_id;
  if (!usuarioId)
    return res.status(400).json({ error: "usuario_id is required" });
  const sql = `
    SELECT DISTINCT a.id_app AS id, a.id_app AS id_app, a.nombre AS name, a.precio AS price,
           a.img1 AS img1, a.img2 AS img2, a.icono AS icon, 
           c.nombre AS category, ? AS usuario_id
    FROM mis_apps m
    JOIN app a ON m.app_id_app = a.id_app
    LEFT JOIN app_categorias ac ON a.id_app = ac.app_id_app
    LEFT JOIN categorias c ON ac.categorias_id = c.id
    WHERE m.usuario_id = ?
    ORDER BY a.id_app DESC
  `;
  db.query(sql, [usuarioId, usuarioId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// Debug: catch unmatched routes (moved here to avoid blocking other routes)
app.use((req, res) => {
  console.warn(`Unhandled route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found" });
});

// Arrancar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Servidor Express escuchando en puerto ${PORT}`)
);
