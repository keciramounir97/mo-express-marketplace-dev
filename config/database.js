// ============================================================================
// FICHIER : backend 2/config/database.js
// RÔLE : Connexion à la base de données NoSQL MongoDB via Mongoose
// ============================================================================

// 1. Importation du module Mongoose pour la modélisation et les requêtes MongoDB
import mongoose from "mongoose";

// 2. Importation de Dotenv pour charger les variables d'environnement (.env)
import dotenv from "dotenv";

// 3. Exécution de dotenv.config() pour lire le fichier .env et populer process.env
dotenv.config();

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aliexpress_clone_db";

  cachedPromise = mongoose.connect(mongoURI, {
    connectTimeoutMS: 3000,
    serverSelectionTimeoutMS: 2000,
  }).then((conn) => {
    console.log(`✅ Base de données MongoDB connectée avec succès sur l'hôte : ${conn.connection.host}`);
    return conn;
  }).catch((error) => {
    cachedPromise = null;
    console.error(`❌ Erreur de connexion à MongoDB : ${error.message}`);
    return null;
  });

  return cachedPromise;
};

export default connectDB;
