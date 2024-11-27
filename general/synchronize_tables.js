"use strict";


const sequelize = require("./connect.js");

sequelize.sync({alter: true});