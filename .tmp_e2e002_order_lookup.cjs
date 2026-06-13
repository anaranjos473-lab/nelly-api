const http = require('http');
const url = 'http://localhost:3001/api/diagnostico/pedidos';
http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const pedidos = Array.isArray(json.pedidos) ? json.pedidos : [];
      const filtered = pedidos.filter(p =>
        p.id === 'AUTO_1776641400683' ||
        p.pedidoId === 'AUTO_1776641400683' ||
        p.id_pedido === 'AUTO_1776641400683'
      );
      if (filtered.length === 0) {
        console.error('NOT_FOUND');
        process.exit(1);
      }
      console.log(JSON.stringify(filtered, null, 2));
    } catch (err) {
      console.error('PARSE_ERROR', err.message);
      console.error(data);
      process.exit(1);
    }
  });
}).on('error', err => {
  console.error('HTTP_ERROR', err.message);
  process.exit(1);
});
