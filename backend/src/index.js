require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const connectDB = require("./db");
const { typeDefs, resolvers } = require("./schema");

const startServer = async () => {
  await connectDB();

  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  server.applyMiddleware({
    app
  });


  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  );
};

startServer();

const fetchBalanceData = require("./services/fetchBalanceData");
const cron = require("node-cron");

// Ejecutar cada día a las 3:00 AM
cron.schedule("0 3 * * *", async () => {
  const now = new Date();
  const oneDayAgo = new Date(now);
  oneDayAgo.setDate(now.getDate() - 1);

  const start = oneDayAgo.toISOString().slice(0, 16);
  const end = now.toISOString().slice(0, 16);

  console.log(`⏳ Ejecutando fetch de REE: ${start} → ${end}`);
  await fetchBalanceData(start, end);
});

// Llamada manual para probar el fetch (por primera vez en entorno local)
if (process.env.NODE_ENV !== "production") {
  (async () => {
    const start = new Date("2019-01-01T00:00:00.000Z");
    const end   = new Date("2019-01-10T00:00:00.000Z"); 
    let cursor = new Date(start);

    while (cursor < end) {
      const next = new Date(cursor);
      next.setDate(cursor.getDate() + 1);

      console.log(`⏳ Fetch manual: ${cursor.toISOString()} → ${next.toISOString()}`);
      await fetchBalanceData(
        cursor.toISOString().slice(0,16),
        next.toISOString().slice(0,16)
      );

      cursor = next;
    }
  })();
}