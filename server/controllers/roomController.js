const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tris');
const roomModel = require('../models/roomModel')(mongoose);

const NEW = 0;
const FULL = 1;
const STARTED = 2;
const FINISHED = 3;
const CLOSED = 4;

exports.listRooms = function (req, res) {
    roomModel.find({status: NEW}, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.getRoom = function (req, res) {
    roomModel.findById(req.params.id, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.addRoom = function (req, res) {
    req.body.status = NEW;
    req.body.playerCount = 0;
    new roomModel(req.body).save(function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.countActiveRooms = function (req, res) {
    roomModel.count({status: {$in: [FULL, STARTED, FINISHED]}}, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.countPlayedGames = function (req, res) {
    roomModel.count({status: {$in: [FINISHED, CLOSED]}}, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.updateRoomCount = function (req, res, id, playerJoined) {
    roomModel.updateOne({_id: id}, {$inc: {playerCount: (playerJoined ? 1 : -1)}}, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

function handleMongooseResponse(res, err, doc) {
    if (err) {
        res.send(err);
    }
    res.json(doc);
}
