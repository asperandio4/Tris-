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
    app.route('/rooms/player/:id')
        .get(roomController.getRoomsByPlayer);
    app.route('/rooms/active-count')
        .get(roomController.countActiveRooms)
    app.route('/rooms/played-count')
        .get(roomController.countPlayedGames)

    app.route('/room/:id')
        .get((req, res) => roomController.getRoom(req, res, false));
    app.route('/room/join/:id')
        .post((req, res) => {
            roomController.updateRoomCount(req, res, true).then(room => {
                props.updateVisibleRooms(null);
                props.updateOnlineGames(null);
                props.informGameStatus(room);
            });
        });
    app.route('/room/leave/:id')
        .post((req, res) => {
            roomController.updateRoomCount(req, res, false).then(room => {
                props.updateVisibleRooms(null);
                props.updateOnlineGames(null)
                props.informGameStatus(room);
            });
        });
    app.route('/room/start/:id')
        .post((req, res) => {
            roomController.startGame(req, res).then(room => {
                props.informGameStatus(room);
            });
        });
    app.route('/room/action/:id')
        .post((req, res) => {
            roomController.actionGame(req, res).then(room => {
                props.informGameStatus(room);
            });
        });
    app.route('/room/msg/:id')
        .post((req, res) => {
            roomController.getRoom(req, res, true).then(room => {
                props.newChatMessage(room, {msg: req.body.msg, from: req.body.from});
            });
        });
};