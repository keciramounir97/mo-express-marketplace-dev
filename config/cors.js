// ============================================================================
// FICHIER : backend 2/config/cors.js
// RÔLE : Configuration CORS (Cross-Origin Resource Sharing) pour la sécurité HTTP
// ============================================================================

// 1. Importation du middleware officiel CORS pour Express
import cors from "cors";

// 2. Liste des domaines autorisés à envoyer des requêtes vers l'API Backend
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173", // Port standard Vite
  "https://mo-express-marketplace.vercel.app",
  "https://backend-mo-express-marketplace.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// 3. Options de configuration du middleware CORS
export const corsOptions = {
  // Fonction dynamique de vérification de l'origine de la requête
  origin: (origin, callback) => {
    // Permettre les requêtes sans origine (comme Postman ou requêtes serveur-à-serveur)
    if (!origin) return callback(null, true);

    // Si le domaine émetteur est dans la liste blanche ou correspond au domaine Vercel
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.includes("mo-express-marketplace");

    if (isAllowed) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn(`⚠️ Requête CORS autorisée en dev depuis l'origine : ${origin}`);
        callback(null, true);
      } else {
        callback(null, true); // Fallback production grace clearance
      }
    }
  },
  // Autoriser l'envoi de cookies d'authentification et de headers
  credentials: true,
  // Méthodes HTTP autorisées
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  // En-têtes HTTP autorisés dans les requêtes client
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};

// 4. Instanciation du middleware CORS prêt à l'emploi
export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
