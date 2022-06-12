const RoomConstants = require("../models/roomConstants").RoomConstants;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tris');
const roomModel = require('../models/roomModel')(mongoose);

/** Many function call an Internal sub-function, used by the server/index.js as well.
 * This is done to reuse code internally, without making new http requests.
 * The Internal sub-function accepts a callback parameter, which is usually called when the operations on the DB are done */

exports.listRooms = function (req, res) {
    exports.listRoomsInternal((err, doc) => handleMongooseResponse(res, err, doc));
}
exports.listRoomsInternal = function (callback) {
    return roomModel.find({status: RoomConstants.NEW}, function (err, doc) {
        callback(err, doc);
    });
}

exports.getRoomsByPlayer = function (req, res) {
    exports.getRoomsByPlayerInternal(req.params.id, (err, doc) => handleMongooseResponse(res, err, doc));
}
exports.getRoomsByPlayerInternal = function (playerToFind, callback) {
    roomModel.find({$or: [{player0: playerToFind}, {player1: playerToFind}]}, function (err, doc) {
        callback(err, doc);
    });
}

exports.getRoom = async function (req, res, returnRoom) {
    const id = req.params.id;
    const doc = await findById(id);
    if (doc === null) {  // Can happen for non-existing rooms
        handleMongooseResponse(res, "roomNotFound", null);
    } else {
        handleMongooseResponse(res, null, doc);
    }
    if (returnRoom) {
        return doc;
    }
}

exports.addRoom = async function (req, res) {
    //New room setup
    req.body.status = RoomConstants.NEW;
    req.body.startingPlayer = req.body.player;
    req.body.playerCount = 0;
    req.body.player0 = '';
    req.body.player1 = '';
    req.body.values = Array(RoomConstants.SPOTS).fill(RoomConstants.MARK_UNSET);
    req.body.winner = '';
    req.body.victoryPos = '';
    req.body.matchNum = 0;
    await new roomModel(req.body).save(function (err, doc) {
        handleMongooseResponse(res, err, doc);
        return err ? null : doc;
    })
}

exports.startGame = async function (req, res) {
    const id = req.params.id;
    const doc = await findById(id);
    if (doc === null) {  // Can happen for non-existing rooms
        handleMongooseResponse(res, "roomNotFound", null);
        return null;
    }

    doc.status = RoomConstants.STARTED;
    return await doc.save().then(savedDoc => {
        handleMongooseResponse(res, null, savedDoc);
        return savedDoc;
    })
}

exports.rematchGame = async function (req, res) {
    const id = req.params.id;
    const doc = await findById(id);
    if (doc === null) {  // Can happen for non-existing rooms
        handleMongooseResponse(res, "roomNotFound", null);
        return null;
    }

    // Save the previous game for statistics, it has a new _id
    let obj = doc.toObject();
    delete obj._id;
    const docClone = new roomModel(obj);
    docClone.status = RoomConstants.CLOSED;
    docClone.playerCount = 0;
    docClone.player0 = '';
    docClone.player1 = '';
    docClone.save();

    // Overwrite the current game, version number increases
    doc.player = doc.startingPlayer;  // switch players
    const temp = doc.player0;
    doc.player0 = doc.player1;
    doc.player1 = temp;
    doc.status = RoomConstants.STARTED;
    doc.values = Array(RoomConstants.SPOTS).fill(RoomConstants.MARK_UNSET);
    doc.winner = '';
    doc.victoryPos = '';
    doc.matchNum = doc.matchNum + 1;
    return await doc.save().then(savedDoc => {
        handleMongooseResponse(res, null, savedDoc);
        return savedDoc;
    })
}

exports.countActiveRooms = function (req, res) {
    exports.listRoomsInternal((err, doc) => handleMongooseResponse(res, err, doc));
}
exports.countActiveRoomsInternal = function (callback) {  //A room is active if it's full, started or finished
    roomModel.count({status: {$in: [RoomConstants.FULL, RoomConstants.STARTED, RoomConstants.FINISHED]}}, function (err, doc) {
        callback(err, doc);
    });
}

exports.countPlayedGames = function (req, res) {
    exports.countPlayedGamesInternal((err, doc) => handleMongooseResponse(res, err, doc));
}
exports.countPlayedGamesInternal = function (callback) {
    roomModel.count({status: {$in: [RoomConstants.FINISHED, RoomConstants.CLOSED]}}, function (err, doc) {
        callback(err, doc);
    });
}

exports.updateRoomCount = async function (req, res, playerJoined) {
    return await exports.updateRoomCountInternal(req.params.id, req.body.myId, playerJoined, (err, doc) => handleMongooseResponse(res, err, doc));
}
exports.updateRoomCountInternal = async function (id, playerId, playerJoined, callback) {
    const doc = await findById(id);
    if (doc === null) {  // Can happen for non-existing rooms
        callback("roomNotFound", null);
        return null;
    }

    if (playerJoined) {
        // Avoid rejoin if already inside or if there is no more room in the room - can happen on refresh
        if (doc.player0 !== playerId && doc.player1 !== playerId && (doc.player0 === '' || doc.player1 === '')) {
            doc.playerCount++;
            if (doc.player0 !== '') {
                doc.player1 = playerId;
            } else {
                doc.player0 = playerId;
            }
        } else {
            callback("roomFull", null);
            return null;
        }
    } else {
        // Avoid removing if not inside - can happen on last user Leave
        if (doc.player0 === playerId || doc.player1 === playerId) {
            doc.playerCount--;
            if (doc.player0 === playerId) {
                doc.player0 = '';
            } else {
                doc.player1 = '';
            }
        }
    }
    return await doc.save().then(savedDoc => {
        callback(null, savedDoc);
        return updateRoomStatus(savedDoc);
    })
}

exports.actionGame = async function (req, res) {
    const id = req.params.id;
    const playerId = req.body.myId;
    const doc = await findById(id);
    if (doc === null) {  // Can happen for non-existing rooms
        handleMongooseResponse(res, "roomNotFound", null);
        return null;
    }

    //Makes the move and checks for game end
    doc.values[req.body.index] = doc.player0 == playerId ? RoomConstants.MARK_P0 : RoomConstants.MARK_P1;
    doc.player = !doc.player;
    const checkResult = checkForGameEnd(doc);
    if (checkResult.gameEnded) {
        doc.status = RoomConstants.FINISHED;
        if (checkResult.victory) {
            doc.winner = checkResult.lastValue == RoomConstants.MARK_P0 ? 'player0' : 'player1';
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

exports.getStats = async function (req, res) {
    let stats = {};
    //Played games
    const playedGames = await roomModel.count({status: {$in: [RoomConstants.FINISHED, RoomConstants.CLOSED]}});
    stats.playedGames = playedGames ? playedGames : 0;

    //Aborted games
    const abortedGames = await roomModel.count({status: RoomConstants.ABORTED});
    stats.abortedGames = abortedGames ? abortedGames : 0;

    //Mean moves per game
    const meanMoves = await roomModel.aggregate([
        {$match: {status: {$in: [RoomConstants.FINISHED, RoomConstants.CLOSED]}}},  //only finished or closed games
        {$project: {values: 1}},  //get values
        {$unwind: "$values"},
        {$match: {"values": {$ne: RoomConstants.MARK_UNSET}}},  // exclude unset values
        {
            $group: {
                _id: "$_id",
                count: {$sum: 1}  //number of moves per match
            }
        },
        {
            $group: {
                _id: "mean",
                mean: {$avg: "$count"}  //avg moves per match
            }
        },
    ]);
    stats.meanMoves = checkIfValidAggregateResponse(meanMoves) ? meanMoves[0].mean : 0;

    //Most winning player (starter vs opponent)
    const winningPlayer = await roomModel.aggregate([
        {$match: {$and: [{status: {$in: [RoomConstants.FINISHED, RoomConstants.CLOSED]}}, {winner: {$ne: ''}}]}}, //only finished or closed games with a winner
        {
            $project: {
                startingPlayer: 1,
                winner: 1,
                playerWinner: {
                    $cond: [  //determines the winning player
                        {
                            $or: [
                                {$and: [{$eq: ["$startingPlayer", false]}, {$eq: ["$winner", "player0"]}]},
                                {$and: [{$eq: ["$startingPlayer", true]}, {$eq: ["$winner", "player1"]}]}
                            ]
                        },
                        "starter", "opponent"
                    ]
                }
            }
        },
        {
            $group: {
                _id: "$playerWinner",
                count: {$sum: 1}  //counts the victories per winning player
            }
        },
    ]);
    stats.winningPlayer = {starter: 0, opponent: 0};
    if (checkIfValidAggregateResponse(winningPlayer)) {
        winningPlayer.forEach(player => {
            if (player._id === "starter") {
                stats.winningPlayer.starter = player.count;
            } else {
                stats.winningPlayer.opponent = player.count;
            }
        })
    }

    //Most used victory position
    const victoryPosition = await roomModel.aggregate([
        {$match: {$and: [{status: {$in: [RoomConstants.FINISHED, RoomConstants.CLOSED]}}, {victoryPos: {$ne: ''}}]}},
        {$project: {victoryPos: 1}},
        {$sortByCount: "$victoryPos"},
        {$limit: 1},
        {$project: {_id: 1}},
    ]);
    stats.victoryPosition = checkIfValidAggregateResponse(victoryPosition) ? victoryPosition[0]._id : '-';

    //Mean number of rematches
    const meanRematches = await roomModel.aggregate([
        {$match: {status: {$in: [RoomConstants.FINISHED, RoomConstants.CLOSED]}}},  //only finished or closed games
        {$project: {matchNum: 1}},  //get match number
        {
            $group: {
                _id: "$matchNum",
                count: {$sum: 1}  //number of match numbers
            }
        },
        {$sort: {"_id": 1}}
    ]);
    if (checkIfValidAggregateResponse(meanRematches)) {
        // Sum real number of rematches
        let meanRematchesPerGame = 0;
        for (let i = 0; i < meanRematches.length - 1; i++) {
            meanRematches[i].count -= meanRematches[i + 1].count;  //don't consider rematches that have rematches
            meanRematchesPerGame += i * meanRematches[i].count;
        }
        meanRematchesPerGame += (meanRematches.length - 1) * meanRematches[meanRematches.length - 1].count;
        // Calculates the mean
        meanRematchesPerGame /= meanRematches.reduce((acc, elem) => acc + parseInt(elem.count), 0);
        stats.meanRematches = meanRematchesPerGame;
    } else {
        stats.meanRematches = 0;
    }

    res.json(stats);
}

/* Determines if the current room status is to update based on the number of players inside it and its last status */
async function updateRoomStatus(doc) {
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
        return await doc.save().then(savedDoc => {
            return savedDoc;
        });
    }
    return doc;
}

/* Checks if the last move caused a victory or no more moves are possible */
function checkForGameEnd(doc) {
    const values = doc.values;
    const valuesPerRow = values.length / Math.sqrt(RoomConstants.SPOTS);

    let victory = false;
    let victoryPos = '';
    let lastValue = RoomConstants.MARK_UNSET;
    //Check per rows
    for (let i = 0; i < valuesPerRow && !victory; i++) {
        if (values[i * valuesPerRow] == RoomConstants.MARK_UNSET) {
            continue;
        }
        lastValue = values[i * valuesPerRow];
        for (let j = 1; j < valuesPerRow && !victory; j++) {
            if (values[i * valuesPerRow + j] == lastValue) {
                if (j == valuesPerRow - 1) {
                    victory = true;
                    victoryPos = 'Row ' + (i + 1);
                }
            } else {
                break;
            }
        }
    }

    //Check per cols
    for (let i = 0; i < valuesPerRow && !victory; i++) {
        if (values[i] == RoomConstants.MARK_UNSET) {
            continue;
        }
        lastValue = values[i];
        for (let j = 1; j < valuesPerRow && !victory; j++) {
            if (values[i + j * valuesPerRow] == lastValue) {
                if (j == valuesPerRow - 1) {
                    victory = true;
                    victoryPos = 'Column ' + (i + 1);
                }
            } else {
                break;
            }
        }
    }

    //Check per main diag
    if (!victory && values[0] != RoomConstants.MARK_UNSET) {
        lastValue = values[0];
        for (let i = 1; i < valuesPerRow; i++) {
            if (values[i * (valuesPerRow + 1)] == lastValue) {
                if (i == valuesPerRow - 1) {
                    victory = true;
                    victoryPos = 'Main Diagonal';
                }
            } else {
                break;
            }
        }
    }

    //Check per secondary diag
    if (!victory && values[valuesPerRow - 1] != RoomConstants.MARK_UNSET) {
        lastValue = values[valuesPerRow - 1];
        for (let i = 2; i <= valuesPerRow; i++) {
            if (values[i * (valuesPerRow - 1)] == lastValue) {
                if (i == valuesPerRow) {
                    victory = true;
                    victoryPos = 'Secondary Diagonal';
                }
            } else {
                break;
            }
        }
    }

    //Check for no more available moves
    let gameEnded = true;
    for (let i = 0; i < values.length && !victory; i++) {
        if (values[i] == RoomConstants.MARK_UNSET) {
            gameEnded = false;
            break;
        }
    }

    return {gameEnded: gameEnded, victory: victory, victoryPos: victoryPos, lastValue: lastValue};
}

/* Wraps the mongoose findById to handle its exceptions in case of no room found */
async function findById(id) {
    try {
        return await roomModel.findById(id);
    } catch (ex) {
        return null;
    }
}

/* Sends the response to the client */
function handleMongooseResponse(res, err, doc) {
    err ? res.send(err) : res.json(doc);
}

/* Check if the response is valid to proceed with calculations using its data */
function checkIfValidAggregateResponse(response) {
    return response && Array.isArray(response) && response.length > 0;
}