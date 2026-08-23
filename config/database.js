// ============================================================================
// FICHIER : backend 2/config/database.js
// RÔLE : Connexion à la base de données NoSQL MongoDB via Mongoose
// ============================================================================

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI && process.env.RENDER) {
    console.warn("⚠️ MONGO_URI non définie sur Render. Veuillez ajouter MONGO_URI dans les variables d'environnement Render.");
    return null;
  }

  const uriToUse = mongoURI || "mongodb://127.0.0.1:27017/aliexpress_clone_db";

  cachedPromise = mongoose
    .connect(uriToUse, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    })
    .then((conn) => {
      console.log(`✅ Base de données MongoDB connectée avec succès sur l'hôte : ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      cachedPromise = null;
      console.error(`❌ Erreur de connexion à MongoDB : ${error.message}`);
      return null;
    });

  return cachedPromise;
};

export default connectDB;
