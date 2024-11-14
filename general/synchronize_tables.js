"use strict";


const { sequelize } = require("./connect_easyprace");

sequelize.sync({alter: true});