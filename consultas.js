const format = require('pg-format');

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "lucy2705",
  database: "joyas",
  port: 5432,
  allowExitOnIdle: true
});

const obtenerJoyas = async ({ limit = 10, order_by = "id_ASC", page = 1 }) => {
  const [campo, direccion] = order_by.split("_");
  const offset = Math.abs((page - 1) * limit);
  
  const campoSeguro = campo.replace(/"/g, '""');
  
  const query = {
    text: `SELECT * FROM inventario ORDER BY "${campoSeguro}" ${direccion} LIMIT $1 OFFSET $2`,
    values: [limit, offset]
  };
  
  const { rows: joyas } = await pool.query(query);
  return joyas;
}

const obtenerJoyasPorFiltros = async ({ 
  precio_min, 
  precio_max, 
  stock_min, 
  categoria, 
  metal 
}) => {
  try {
    let filtros = [];
    let values = [];
    let i = 1;

    const agregarFiltro = (condicion, valor) => {
      if (valor !== undefined && !isNaN(valor)) {
        filtros.push(condicion.replace('$i', `$${i}`));
        values.push(valor);
        i++;
      }
    };

    // Aseguramos que los valores numéricos sean válidos
    agregarFiltro('precio >= $i', parseInt(precio_min));
    agregarFiltro('precio <= $i', parseInt(precio_max));
    agregarFiltro('stock >= $i', parseInt(stock_min));
    agregarFiltro('categoria = $i', categoria);
    agregarFiltro('metal = $i', metal);

    let consulta = "SELECT * FROM inventario";
    if (filtros.length > 0) {
      consulta += ` WHERE ${filtros.join(" AND ")}`;
    }

    const query = {
      text: consulta,
      values: values
    };

    const { rows: joyas } = await pool.query(query);
    return joyas;

  } catch (error) {
    console.error('Error ejecutando la consulta:', error);
    throw new Error('Error en la consulta a la base de datos');
  }
}

module.exports = { obtenerJoyas, obtenerJoyasPorFiltros };