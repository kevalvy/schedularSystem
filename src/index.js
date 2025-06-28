import express from'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ENV_CONFIG from './lib/constant.js';

const app=express();
const port=ENV_CONFIG.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data



app.listen(port,()=>console.log('serever start on port',port))