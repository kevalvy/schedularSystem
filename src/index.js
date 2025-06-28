import express from'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ENV_CONFIG from './lib/constant.js';
import availabilityRouter from './routes/avaialability.js'
import bookingRouter from './routes/booking.js'
import userRouter from './routes/user.js'

const app=express();
const port=ENV_CONFIG.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(express.static(join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});
app.get('/register-user', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'add-user.html'));
});
app.get('/book/:username', (req, res) => {
    // For now, we will serve a static HTML file for any valid username.
    // We will create this HTML file in the next step.
    res.sendFile(join(__dirname, '..', 'public', 'booking.html'));
});
app.use('/api/availability', availabilityRouter);
app.use('/api/book', bookingRouter);
app.use('/api/users', userRouter); //



app.listen(port,()=>console.log('serever start on port',port))