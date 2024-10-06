const express = require('express');
const { obtenerJoyas, obtenerJoyasPorFiltros } = require('./consultas');
const app = express();

const logRequests = (req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] - ${req.method} request to ${req.originalUrl}`);
  next();
};
app.use(logRequests);

app.get('/joyas', async (req, res) => {
  try {
    const joyas = await obtenerJoyas(req.query);
    const joyasConLinks = joyas.map(joya => ({
      ...joya,
      links: {
        self: `/joyas/${joya.id}`,
        filters: `/joyas/filtros?precio_min=&precio_max=&categoria=&metal=`,
        all: `/joyas`
      }
    }));
    
    res.json({
      joyas: joyasConLinks,
      total: joyas.length,
      links: {
        self: req.originalUrl,
        next: `/joyas?page=${parseInt(req.query.page || 1) + 1}`,
        prev: `/joyas?page=${parseInt(req.query.page || 1) - 1 > 0 ? parseInt(req.query.page) - 1 : 1}`
      }
    });
  } catch (error) {
    console.error('Error al obtener las joyas:', error);
    res.status(500).json({ error: 'Error al obtener las joyas' });
  }
});

app.get('/joyas/filtros', async (req, res) => {
  try {
    const queryStrings = req.query;
    const precio_min = parseInt(queryStrings.precio_min);
    const precio_max = parseInt(queryStrings.precio_max);
    const stock_min = parseInt(queryStrings.stock_min);

    const joyas = await obtenerJoyasPorFiltros({
      precio_min,
      precio_max,
      stock_min,
      categoria: queryStrings.categoria,
      metal: queryStrings.metal
    });

    res.json(joyas);
  } catch (error) {
    console.error('Error al filtrar las joyas:', error);
    res.status(500).json({ error: 'Error al filtrar las joyas' });
  }
});

app.listen(3000, console.log('Server ON'));