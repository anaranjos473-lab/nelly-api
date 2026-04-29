// src/middlewares/secureHeaders.js
import helmet from 'helmet';

export default helmet({
  contentSecurityPolicy: false // Puedes personalizar según tus necesidades
});
