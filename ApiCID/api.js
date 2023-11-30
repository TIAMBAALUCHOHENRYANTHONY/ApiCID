const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('./src/db/db');
const usuarioModel = require('./src/models/usuarioModel');

const bcrypt = require('bcrypt');



const app = express();
const PORT = 3000;
const secretKey = '12345';

// Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.json());

// Middleware para conectar a MongoDB antes de que se manejen las rutas
app.use(async (req, res, next) => {
  try {
    req.db = await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).send('Error al conectar a MongoDB');
  }
});

// Ruta para obtener datos de nombre de usuario encriptado
app.get('/usuarios', async (req, res) => {
  try {
    const collection = req.db.collection('Persona');
    const result = await collection.find({}, { projection: { _id: 0, username: 1, passwordHash: 1 } }).toArray();

    // Encriptar el username antes de enviarlo como respuesta
    const encryptedResult = result.map((user) => {
      return {
        username: usuarioModel.encryptPassword(user.username),
        passwordHash: user.passwordHash,
      };
    });

    res.json(encryptedResult);
  } catch (error) {
    console.error('Error al obtener datos de MongoDB', error);
    res.status(500).send('Error al obtener datos de MongoDB');
  }
});

app.post('/usuarios', async (req, res) => {
    try {
      const collection = req.db.collection('Persona');
  
      // Encriptar la contraseña antes de guardarla en la base de datos
      const encryptedPassword = bcrypt.hashSync(req.body.password, 10); // Utilizando bcrypt para encriptar la contraseña
  
      // Crear el objeto de usuario con la contraseña encriptada
      const user = {
        username: req.body.username,
        passwordHash: encryptedPassword,
      };
  
      // Insertar el usuario en la base de datos
      const result = await collection.insertOne(user);
  
      res.json({ message: 'Usuario creado exitosamente', insertedId: result.insertedId });
    } catch (error) {
      console.error('Error al insertar datos en MongoDB', error);
      res.status(500).send('Error al insertar datos en MongoDB');
    }
  });


    // Ruta para autenticar usuarios
    app.post('/auth', async (req, res) => {
        try {
        const collection = req.db.collection('Persona');
    
        // Buscar el usuario en la base de datos
        const user = await collection.findOne({ username: req.body.username });
    
        // Si el usuario no existe, responder con un error
        if (!user) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    
        // Si el usuario existe, comparar la contraseña enviada con la contraseña en la base de datos
        const result = bcrypt.compareSync(req.body.password, user.passwordHash);
    
        // Si las contraseñas no coinciden, responder con un error
        if (!result) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    
        // Si las contraseñas coinciden, generar un JWT con el username del usuario
        const token = jwt.sign({ username: user.username }, secretKey);
    
        // Responder con el JWT
        res.json({ token });
        } catch (error) {
        console.error('Error al autenticar usuario', error);
        res.status(500).send('Error al autenticar usuario');
        }
    });

// Resto de las rutas y lógica

// Inicia el servidor Express
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
