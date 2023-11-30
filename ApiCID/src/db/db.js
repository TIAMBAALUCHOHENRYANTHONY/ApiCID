const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const usuarioModel = require('../models/usuarioModel');

const url = 'mongodb+srv://Henry:henry123@cluster0.cs9yu3k.mongodb.net/CID?retryWrites=true&w=majority';
const dbName = 'CID';

const connectToDatabase = async () => {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Conexión a MongoDB establecida correctamente');
    return client.db(dbName);
  } catch (error) {
    console.error('Error al conectar a MongoDB', error);
    throw error;
  }
};

module.exports = connectToDatabase;
