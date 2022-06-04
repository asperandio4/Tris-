const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tris');
const roomModel = require('../models/roomModel')(mongoose);

const NEW = 0;
const FULL = 1;
const STARTED = 2;
const FINISHED = 3;
const CLOSED = 4;
const ABORTED = 5;

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
    req.body.player0 = '';
    req.body.player1 = '';
    new roomModel(req.body).save(function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.startGame = async function (req, res) {
    const id = req.params.id;
    const playerId = req.body.myId;
    const doc = await roomModel.findById(id);

    doc.status = STARTED;
    return await doc.save().then(savedDoc => {
        handleMongooseResponse(res, null, savedDoc);
        return savedDoc.player0 != playerId ? savedDoc.player0 : savedDoc.player1;
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

exports.updateRoomCount = async function (req, res, playerJoined) {
    const id = req.params.id;
    const playerId = req.body.myId;
    const doc = await roomModel.findById(id);

    if (playerJoined) {
        doc.playerCount++;
        if (doc.player0 != '') {
            doc.player1 = playerId;
        } else {
            doc.player0 = playerId;
        }
    } else {
        doc.playerCount--;
        if (doc.player0 == playerId) {
            doc.player0 = '';
        } else {
            doc.player1 = '';
        }
    }
    return await doc.save().then(savedDoc => {
        handleMongooseResponse(res, null, savedDoc);
        return updateRoomStatus(savedDoc);
    })
}

function updateRoomStatus(doc) {
    if (doc.playerCount <= 0) {
        doc.status = doc.status == FINISHED ? CLOSED : ABORTED;
        doc.save();
    } else if (doc.playerCount == 1) {
        if (doc.status == FULL || doc.status == STARTED) {
            let newStatus = doc.status == FULL ? NEW : ABORTED;
            doc.status = newStatus;
            doc.save();

            if (newStatus == ABORTED) {
                return doc.player0 != '' ? doc.player0 : doc.player1;
            }
        }
    } else {
        if (doc.status == NEW) {
            doc.status = FULL;
            doc.save();
        }
    }
    return false;
}

function handleMongooseResponse(res, err, doc) {
    if (err) {
        res.send(err);
    }
    res.json(doc);
}
