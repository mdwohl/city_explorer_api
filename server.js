'use strict'

//List of Packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();

//Global Vars
const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());

//Start server
app.listen(PORT, () => console.log(`listening to port: ${PORT}`));
