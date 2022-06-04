const {RoomConstants} = require("../models/roomConstants");
const roomController = require("../controllers/roomController");
module.exports = function (app, props) {
    app.route('/').get((req, res) => res.send({response: "I am alive"}).status(200));

    let roomController = require('../controllers/roomController');
    app.route('/rooms')
        .get(roomController.listRooms)
        .post((req, res) => {
            roomController.addRoom(req, res);
            props.updateVisibleRooms(null);
            props.updateOnlineGames(null);
        });
    app.route('/room/:id')
        .get((req, res) => roomController.getRoom(req, res, false));
    //.put(roomController.updateRoom)
    //.delete(roomController.deleteRoom);
    app.route('/room/getData/:id')
        .post((req, res) => {
            roomController.getRoom(req, res, true).then(room => {
                props.informGameStatus(room, req.body.myId);
            });
        })
    app.route('/room/join/:id')
        .post((req, res) => {
            roomController.updateRoomCount(req, res, true).then(statusChange => {
                props.updateVisibleRooms(null);
                props.updateOnlineGames(null);

                if (statusChange && statusChange.newStatus == RoomConstants.FULL) {
                    props.informGameFull(statusChange.player0, true);
                    props.informGameFull(statusChange.player1, true);
                }
            });
        });
    app.route('/room/leave/:id')
        .post((req, res) => {
            roomController.updateRoomCount(req, res, false).then(statusChange => {
                props.updateVisibleRooms(null);
                props.updateOnlineGames(null)

                if (statusChange) {
                    if (statusChange.newStatus == RoomConstants.NEW) {
                        props.informGameFull(statusChange.player0, false);
                        props.informGameFull(statusChange.player1, false);
                    } else if (statusChange.newStatus == RoomConstants.ABORTED) {
                        props.informGameAborted(statusChange.player0, true);
                        props.informGameAborted(statusChange.player1, true);
                    }
                }
            });
        });
    app.route('/room/start/:id')
        .post((req, res) => {
            roomController.startGame(req, res).then(otherPlayerId => {
                props.informGameStarted(req.body.myId, true);
                props.informGameStarted(otherPlayerId, true);
            });
        });
    app.route('/room/action/:id')
        .post((req, res) => {
            roomController.actionGame(req, res).then(room => {
                props.informGameStatus(room, room.player0);
                props.informGameStatus(room, room.player1);
            });
        });
    app.route('/rooms/active-count')
        .get(roomController.countActiveRooms)
    app.route('/rooms/played-count')
        .get(roomController.countPlayedGames)
};