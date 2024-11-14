"use strict";


const { DataTypes } = require("sequelize");
const sequelize = require("./connect.js");

exports.Vacancy_EasyPrace = sequelize.define(
    'easypracecz',
    {
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        employer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        address: DataTypes.TEXT,
        salary: DataTypes.TEXT,
        employment_type: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        link: {
            type: DataTypes.TEXT,
            allowNull: false
        },
    },
    {
        tableName: 'easypracecz',
    }
);

exports.Vacancy_Jobs = sequelize.define(
    'jobscz',
    {
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        employer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        address: DataTypes.TEXT,
        features: DataTypes.TEXT,
        link: {
            type: DataTypes.TEXT,
            allowNull: false
        },
    },
    {
        tableName: 'jobscz',
    }
);

exports.Vacancy_Prace = sequelize.define(
    'pracecz',
    {
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        employer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        city: DataTypes.TEXT,
        salary: DataTypes.TEXT,
        employment_type: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        link: {
            type: DataTypes.TEXT,
            allowNull: false
        },
    },
    {
        tableName: 'pracecz',
    }
);

exports.Vacancy_Pracezarohem = sequelize.define(
    'pracezarohemcz',
    {
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        employer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        address: DataTypes.TEXT,
        salary: DataTypes.TEXT,
        link: {
            type: DataTypes.TEXT,
            allowNull: false
        },
    },
    {
        tableName: 'pracezarohemcz',
    }
);

exports.Vacancy_Profesia = sequelize.define(
    'profesiacz',
    {
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        employer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        address: DataTypes.TEXT,
        salary: DataTypes.TEXT,
        link: {
            type: DataTypes.TEXT,
            allowNull: false
        },
    },
    {
        tableName: 'profesiacz',
    }
);

exports.Task = sequelize.define(
    "task",
    {
        website: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                isIn: [["Success", "Failure"]],
            },
        },
    }
);