const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
const { appsData } = require("../src/data/appsData");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Master12$", // tu contraseña
  database: "devplay",
});

db.connect((err) => {
  if (err) return console.error("MySQL connect error:", err);
  console.log("Conectado a MySQL, empezando import...");

  appsData.forEach((app) => {
    const slug = app.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const baseDir = path.join(__dirname, "..", "assets", "games", slug);

    const readBlob = (name) => {
      const file = path.join(baseDir, name);
      return fs.existsSync(file) ? fs.readFileSync(file) : null;
    };
    const icono = readBlob("icon.jpg");
    const img1 = readBlob("screenshot1.jpg");
    const img2 = readBlob("screenshot2.jpg");
    const img3 = readBlob("screenshot3.jpg");

    const precio = app.isFree
      ? "0"
      : (app.salePrice || app.originalPrice || "0").toString().replace("$", "");

    const sql = `
      INSERT INTO app
        (precio, nombre, id_desarrollador, descripcion,
         img1, img2, img3, icono,
         rango_edad, peso, fecha_creacion, status_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
    const params = [
      precio,
      app.name,
      1,
      app.description.es,
      img1,
      img2,
      img3,
      icono,
      app.ageRating,
      app.size,
      1,
    ];

    db.query(sql, params, (e, r) => {
      if (e) console.error("Error insertando", app.name, e);
      else console.log("Insertado:", app.name, "→ id_app =", r.insertId);
    });
  });

  // cierra la conexión tras 10s (ajusta según número de apps)
  setTimeout(() => db.end(), 10000);
});
