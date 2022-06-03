const mongoose = require('mongoose');
const {json} = require("express");
mongoose.connect('mongodb://localhost:27017/tris');
const roomModel = require('../models/roomModel')(mongoose);

exports.listRooms = function (req, res) {
    roomModel.find({}, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.getRoom = function (req, res) {
    roomModel.findById(req.params.id, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.addRoom = function (req, res) {
    new roomModel(req.body).save(function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

function handleMongooseResponse(res, err, doc) {
    if (err) {
        res.send(err);
    }
    res.json(doc);
}
