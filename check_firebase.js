const admin = require("firebase-admin");
const serviceAccount = require("./nelly-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nelly-delivery-default-rtdb.firebaseio.com"
});

const db = admin.database();
const id = "AUTO_1776542570508";

async function check() {
  try {
    const snap1 = await db.ref(`pedidos/${id}`).once("value");
    const exists1 = snap1.exists();
    
    const snap2 = await db.ref(`pedidos_para_reparto/${id}`).once("value");
    const exists2 = snap2.exists();
    
    console.log(JSON.stringify({
      "pedidos/AUTO_1776542570508": exists1,
      "pedidos_para_reparto/AUTO_1776542570508": exists2
    }, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

check();
