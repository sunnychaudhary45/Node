const express = require('express');
const app = express();
const environmentsettings = require('../config/environmentsettings');
const settings=environmentsettings.settings();
const cors=require('cors');
const bodyParser=require('body-parser');
const error = require('../middleware/errorhandling.middleware');
const errorunCaughtHandle = require('../middleware/uncaughterror.middleware');


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use('/uploads',express.static('uploads'));
require('../route/route')(app);
app.use(error);
app.listen(settings.port,()=>{console.log(`application running on port ${settings.port} number.`)})