const rethinkdb = require("rethinkdb");

let connection = null;
let isConnecting = false;

async function connectToDB(retry = true) {
  // Eğer bağlantı mevcutsa ve açık ise geri döndür
  if (connection && connection.open) {
    return connection;
  }

  if (isConnecting) {
    // Başka bir bağlantı kuruluyorsa bekle
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (connection && connection.open) {
          clearInterval(interval);
          resolve(connection);
        }
      }, 100);
    });
  }

  isConnecting = true;

  try {
    connection = await rethinkdb.connect({
      host: "localhost",
      port: 28015,
      db: "test", // kendi veritabanın neyse
    });

    console.log("✅ RethinkDB bağlantısı başarılı.");

    // Bağlantı kapanırsa null yap
    connection.on("close", () => {
      console.warn("⚠️ RethinkDB bağlantısı kapandı.");
      connection = null;
    });

    connection.on("error", (err) => {
      console.error("💥 RethinkDB bağlantı hatası:", err);
      connection = null;
    });

    return connection;
  } catch (err) {
    console.error("❌ RethinkDB bağlantı kurulamadı:", err);
    connection = null;

    if (retry) {
      console.log("🔁 3 saniye içinde tekrar deneniyor...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return connectToDB(false); // 1 kere retry et
    }

    throw err;
  } finally {
    isConnecting = false;
  }
}

module.exports = {
  r: rethinkdb,
  connectToDB,
};

// bağlantı tek seferde kurulur ve kopması durumunda otomatik bağlantı yapılır.
