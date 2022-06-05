const RoomConstants = require("../models/roomConstants").RoomConstants;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tris');
const roomModel = require('../models/roomModel')(mongoose);

exports.listRooms = function (req, res) {
    roomModel.find({status: RoomConstants.NEW}, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.getRoomsByPlayer = function (req, res) {
    let playerToFind = req.params.id;
    roomModel.find({$or: [{player0: playerToFind}, {player1: playerToFind}]}, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.getRoom = async function (req, res, returnRoom) {
    const id = req.params.id;
    const doc = await roomModel.findById(id);
    if (doc === null) {  // Can happen for non-existing rooms
        return null;
    }

    handleMongooseResponse(res, null, doc);
    if (returnRoom) {
        return doc;
    }
}

exports.addRoom = function (req, res) {
    req.body.status = RoomConstants.NEW;
    req.body.playerCount = 0;
    req.body.player0 = '';
    req.body.player1 = '';
    req.body.values = Array(RoomConstants.SPOTS).fill(RoomConstants.UNSET);
    req.body.winner = '';
    req.body.victoryPos = '';
    new roomModel(req.body).save(function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.startGame = async function (req, res) {
    const id = req.params.id;
    const doc = await roomModel.findById(id);
    if (doc === null) {  // Can happen for non-existing rooms
        return null;
    }

    doc.status = RoomConstants.STARTED;
    return await doc.save().then(savedDoc => {
        handleMongooseResponse(res, null, savedDoc);
        return savedDoc;
    })
}

exports.countActiveRooms = function (req, res) {
    roomModel.count({status: {$in: [RoomConstants.FULL, RoomConstants.STARTED, RoomConstants.FINISHED]}}, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.countPlayedGames = function (req, res) {
    roomModel.count({status: {$in: [RoomConstants.FINISHED, RoomConstants.CLOSED]}}, function (err, doc) {
        handleMongooseResponse(res, err, doc);
    })
}

exports.updateRoomCount = async function (req, res, playerJoined) {
    const id = req.params.id;
    const playerId = req.body.myId;
    const doc = await roomModel.findById(id);
    if (doc === null) {  // Can happen for non-existing rooms
        return null;
    }

    if (playerJoined) {
        // Avoid rejoin if already inside
        if (doc.player0 !== playerId && doc.player1 !== playerId) {
            doc.playerCount++;
            if (doc.player0 !== '') {
                doc.player1 = playerId;
            } else {
                doc.player0 = playerId;
            }
        }
    } else {
        doc.playerCount--;
        if (doc.player0 === playerId) {
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

exports.actionGame = async function (req, res) {
    const id = req.params.id;
    const playerId = req.body.myId;
    const doc = await roomModel.findById(id);
    if (doc === null) {  // Can happen for non-existing rooms
        return null;
    }

    doc.values[req.body.index] = doc.player0 == playerId ? RoomConstants.CIRCLE : RoomConstants.CROSS;
    doc.player = !doc.player;
    const checkResult = checkForGameEnd(doc);
    if (checkResult.gameEnded) {
        doc.status = RoomConstants.FINISHED;
        if (checkResult.victory) {
            doc.winner = checkResult.lastValue == RoomConstants.CIRCLE ? 'player0' : 'player1';
            doc.victoryPos = checkResult.victoryPos;
        } else {
            doc.winner = '';
            doc.victoryPos = '';
        }
    }

    return await doc.save().then(savedDoc => {
        handleMongooseResponse(res, null, savedDoc);
        return savedDoc;
    })
}

function updateRoomStatus(doc) {
    let newStatus = doc.status;
    if (doc.playerCount <= 0) {
        if (doc.status != RoomConstants.CLOSED) {
            newStatus = RoomConstants.ABORTED;
        }
    } else if (doc.playerCount == 1) {
        if (doc.status == RoomConstants.FULL) {
            newStatus = RoomConstants.NEW;
        } else if (doc.status == RoomConstants.STARTED) {
            newStatus = RoomConstants.ABORTED;
        } else if (doc.status == RoomConstants.FINISHED) {
            newStatus = RoomConstants.CLOSED;
        }
    } else {
        if (doc.status == RoomConstants.NEW) {
            newStatus = RoomConstants.FULL;
        }
    }
    if (newStatus != doc.status) {
        doc.status = newStatus;
        doc.save();
    }
    return doc;
}

function checkForGameEnd(doc) {
    const values = doc.values;
    const valuesPerRow = values.length / RoomConstants.SPOTS_PER_ROW;

    let victory = false;
    let victoryPos = '';
    let lastValue = RoomConstants.UNSET;
    //Check per rows
    for (let i = 0; i < valuesPerRow && !victory; i++) {
        if (values[i * valuesPerRow] == RoomConstants.UNSET) {
            continue;
        }
        lastValue = values[i * valuesPerRow];
        for (let j = 1; j < valuesPerRow && !victory; j++) {
            if (values[i * valuesPerRow + j] == lastValue) {
                if (j == valuesPerRow - 1) {
                    victory = true;
                    victoryPos = 'r' + i;
                }
            } else {
                break;
            }
        }
    }

    //Check per cols
    for (let i = 0; i < valuesPerRow && !victory; i++) {
        if (values[i] == RoomConstants.UNSET) {
            continue;
        }
        lastValue = values[i];
        for (let j = 1; j < valuesPerRow && !victory; j++) {
            if (values[i + j * valuesPerRow] == lastValue) {
                if (j == valuesPerRow - 1) {
                    victory = true;
                    victoryPos = 'c' + i;
                }
            } else {
                break;
            }
        }
    }

    //Check per main diag
    if (!victory && values[0] != RoomConstants.UNSET) {
        lastValue = values[0];
        for (let i = 1; i < valuesPerRow; i++) {
            if (values[i * (valuesPerRow + 1)] == lastValue) {
                if (i == valuesPerRow - 1) {
                    victory = true;
                    victoryPos = 'd0';
                }
            } else {
                break;
            }
        }
    }

    //Check per secondary diag
    if (!victory && values[valuesPerRow - 1] != RoomConstants.UNSET) {
        lastValue = values[valuesPerRow - 1];
        for (let i = 2; i <= valuesPerRow; i++) {
            if (values[i * (valuesPerRow - 1)] == lastValue) {
                if (i == valuesPerRow) {
                    victory = true;
                    victoryPos = 'd1';
                }
            } else {
                break;
            }
        }
    }

    //Check for no more moves available
    let gameEnded = true;
    for (let i = 0; i < values.length && !victory; i++) {
        if (values[i] == RoomConstants.UNSET) {
            gameEnded = false;
            break;
        }
    }

    return {gameEnded: gameEnded, victory: victory, victoryPos: victoryPos, lastValue: lastValue};
}

function handleMongooseResponse(res, err, doc) {
    if (err) {
        res.send(err);
    }
    res.json(doc);
}
