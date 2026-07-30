// Configuracion Maestra Nelly Delivery para validacion local.
// Este puente evita depender de los SDK remotos de Firebase cuando el entorno bloquea gstatic.
export { auth, rtdb, ref, onValue, off, onChildAdded, onChildChanged, onChildRemoved, query, orderByChild, equalTo, set, update, runTransaction, push } from "./premium-kitchen/firebase/index.js";

