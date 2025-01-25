//Import
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rulesRoute = require('./routes/rulesRoute');
const authRoute = require('./routes/authRoute');
const alertRoute = require('./routes/alertRoute');
const app = express();
//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));
app.listen(process.env.PORT, () =>
    console.log('Server is running on port', process.env.PORT));
app.use(morgan('dev'));
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
    }
));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/rules', rulesRoute);
app.use('/auth', authRoute);
app.use ('/alerts', alertRoute);

