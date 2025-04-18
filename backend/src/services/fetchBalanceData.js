const fs = require("fs");
const path = require("path");
const axios = require("axios");
const BalanceEntry = require("../models/BalanceEntry");

const REE_API_URL = "https://apidatos.ree.es/es/datos/balance/balance-electrico";
const FALLBACK_DIR = path.join(__dirname, "../fallbacks");

// Asegura que exista el directorio
if (!fs.existsSync(FALLBACK_DIR)) {
  fs.mkdirSync(FALLBACK_DIR);
}

const sanitizeKey = (key) => key.replace(/[.$]/g, "_");

const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    console.warn(`🔁 Reintentando (${3 - retries + 1}/3)...`);
    await new Promise(res => setTimeout(res, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

const fetchBalanceData = async (startDate, endDate, timeTrunc = "day") => {
  const fallbackFilename = `${startDate.split("T")[0]}_${endDate.split("T")[0]}.json`;
  const fallbackPath = path.join(FALLBACK_DIR, fallbackFilename);

  let data;

  try {
    const params = { start_date: startDate, end_date: endDate, time_trunc: timeTrunc };

    const response = await retryRequest(() => axios.get(REE_API_URL, { params }));

    data = response.data;

    // Guardar fallback solo si recibimos una buena respuesta
    fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), "utf-8");

    console.log(`💾 Backup guardado en: ${fallbackPath}`);
  } catch (err) {
    console.error(`⚠️ API REE falló: ${err.message}`);

    if (fs.existsSync(fallbackPath)) {
      console.warn("📂 Usando fallback local en su lugar.");
      data = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
    } else {
      console.error("❌ No se pudo obtener datos ni desde la API ni desde fallback.");
      return;
    }
  }

  const included = data?.included;
  if (!Array.isArray(included)) {
    console.warn("⚠️ Estructura de datos inválida (falta `included`).");
    return;
  }

  let totalUpserts = 0;

  for (const indicator of included) {
    const groupId = indicator?.id || "unknown";
    const contents = indicator?.attributes?.content;
    if (!Array.isArray(contents)) continue;

    for (const item of contents) {
      const originalLabel = item?.attributes?.title || item?.id;
      const key = sanitizeKey(originalLabel || "sin_titulo");
      const values = item?.attributes?.values;
      if (!Array.isArray(values)) continue;

      for (const entry of values) {
        const date = new Date(entry?.datetime);
        if (isNaN(date) || typeof entry.value !== "number") continue;

        await BalanceEntry.updateOne(
          { datetime: date },
          {
            $set: {
              datetime: date,
              [`values.${key}`]: entry.value,
              [`labels.${key}`]: originalLabel,
              fetchedAt: new Date(),
            },
          },
          { upsert: true }
        );

        totalUpserts++;
      }
    }
  }

  console.log(`✅ Guardados ${totalUpserts} valores.`);
};

module.exports = fetchBalanceData;
