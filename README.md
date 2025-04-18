# ⚡ Balance Eléctrico España – Fullstack App

Aplicación fullstack para visualizar el balance eléctrico español usando datos de la API pública de Red Eléctrica Española (REE), con backend en Node.js + GraphQL + MongoDB y frontend en React.

---

## 🧠 Conceptos y Decisiones Clave

- **Seed histórico inicial:** Iteración día a día sobre fechas pasadas, ya que la API de REE no permite rangos amplios.
- **Fallback inteligente en el backend:** Si la API falla, se sirve la información desde MongoDB sin romper la experiencia.
- **Validaciones robustas en el frontend:** La UI impide consultas si faltan fechas o si el rango no es válido.
- **Gráficos dinámicos y filtrables:** Recharts con selección de tipo (líneas, barras, apiladas) y filtros por categoría.
- **Sistema de testeo completo:** Pruebas automáticas para componentes, lógica de datos y manejo de errores.
- **Contenedorización con Docker:** Archivos `Dockerfile` y `docker-compose.yml` incluidos (uso opcional).
- **Manejo de errores amigable:** Mensajes claros al usuario, control de errores GraphQL y fallbacks bien definidos.

---

## 🔄 Pipeline de Datos

1. **API oficial de REE:** Consulta vía fetch HTTP.
2. **Normalización de datos:**
   - Agrupados por día y tecnología.
   - Fechas en formato ISO.
   - Estructura:

```json
{
  "datetime": "2025-04-01T00:00:00Z",
  "values": {
    "Eólica": 5000,
    "Nuclear": 3000
  },
  "labels": {
    "Eólica": "Eólica",
    "Nuclear": "Nuclear"
  }
}
```

3. **Persistencia:** MongoDB en la colección `balance_entries`.
4. **Exposición:** API GraphQL en `/graphql`.
5. **Consumo:** React + Apollo Client + Recharts.

---

## 🧰 Modelo de Datos MongoDB

```js
{
  datetime: ISODate,
  values: {
    "Eólica": Number,
    "Nuclear": Number,
    ...
  },
  labels: {
    "Eólica": String,
    "Nuclear": String
  }
}
```

---

## 🚀 Backend

### 🔧 Requisitos

- Node.js 18+
- MongoDB
- `.env`:

```env
MONGO_URI=mongodb://localhost:27017/balance
PORT=4000
```

### ▶️ Ejecutar

```bash
cd backend
npm install
npm run dev
```

### 🧪 Tests

```bash
npm test
```

---

## 💻 Frontend

### 🛠️ Requisitos

- Node.js 18+
- `.env`:

```env
REACT_APP_API_URL=http://localhost:4000/graphql
```

### ▶️ Ejecutar

```bash
cd frontend
npm install
npm start
```

### 🧪 Tests

```bash
npm test
```

---

## 🐳 Docker

```bash
docker-compose up --build
```

Incluye:

- `frontend`: React SPA
- `backend`: API GraphQL
- `mongo`: MongoDB

> Alternativamente se puede ejecutar cada parte localmente sin Docker.

---

## 🔐 Seguridad

- El backend valida fechas y evita queries vacías.
- El frontend muestra mensajes claros en caso de error o mal uso.

---

## 🔢 Consultas GraphQL de Ejemplo

### 🔍 Query

```graphql
query {
  getBalanceEntries(startDate: "2025-04-01T00:00:00.000Z", endDate: "2025-04-01T23:59:00.000Z") {
    datetime
    values
    labels
  }
}
```

### 🧾 Resultado esperado

```json
[
  {
    "datetime": "2025-04-01T00:00:00Z",
    "values": {
      "Eólica": 5000,
      "Nuclear": 3000
    },
    "labels": {
      "Eólica": "Eólica",
      "Nuclear": "Nuclear"
    }
  }
]
```

---

## 📷 Capturas del Frontend

### 🗄️ Pantalla principal

![Vista principal](./frontend/public/screenshots/main.png)

### 🎛️ Gráfico con filtros

![Gráfico con filtros](./frontend/public/screenshots/filters.png)

### ⚠️ Mensaje de error

![Mensaje de error](./frontend/public/screenshots/error.png)


---

## 📁 Estructura del Proyecto

```
fs-balance-test/
├── backend/
│   ├── src/                    # Source code
│   ├── tests/                  # Test files
│   ├── node_modules/           # Dependencies
│   ├── package.json            # Backend dependencies and scripts
│   ├── package-lock.json       # Lock file for dependencies
│   ├── jest.config.js          # Jest configuration
│   ├── .env                    # Environment variables
│   └── Dockerfile              # Docker configuration for backend
│
├── frontend/
│   ├── src/                    # React source code
│   ├── public/                 # Static files
│   ├── node_modules/           # Dependencies
│   ├── package.json            # Frontend dependencies and scripts
│   ├── package-lock.json       # Lock file for dependencies
│   ├── README.md               # Frontend documentation
│   ├── .gitignore              # Git ignore rules
│   └── Dockerfile              # Docker configuration for frontend
│
│
└── docker-compose.yml          # Docker compose configuration
```

---

## ✅ Checklist Final

- [x] Backend modular y testeado
- [x] GraphQL funcionando y validado
- [x] MongoDB con estructura clara
- [x] SPA en React con UX fluida
- [x] Tests para lógica, UI y errores
- [x] Docker opcional y funcional
- [x] Documentación clara y profesional

---

## ✍️ Autor

Desarrollado por **Cristian Guardeño**

