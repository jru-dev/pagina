const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // sirve tu index.html

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render usará esto
  ssl: {
    rejectUnauthorized: false
  }
});


// Ruta de prueba
app.get('/test', (req, res) => {
  res.send('Servidor funcionando 🚀');
});

// CREATE (guardar datos del formulario)
app.post('/contacto', async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    const result = await pool.query(
      'INSERT INTO usuarios(nombre, email, mensaje) VALUES($1,$2,$3) RETURNING *',
      [nombre, email, mensaje]
    );

    res.json({
      ok: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: 'Error al guardar en la base de datos'
    });
  }
});

// READ (ver usuarios)
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY id DESC');

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// DELETE (eliminar usuario)
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

    res.json({ mensaje: 'Usuario eliminado' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

// ================== SERVIDOR ==================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});