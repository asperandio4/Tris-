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
        .get(roomController.getRoom)
    //.put(roomController.updateRoom)
    //.delete(roomController.deleteRoom);
    app.route('/room/join/:id')
        .post((req, res) => {
            roomController.updateRoomCount(req, res, true).then(() => {
                props.updateVisibleRooms(null);
                props.updateOnlineGames(null);
            });
        });
    app.route('/room/leave/:id')
        .post((req, res) => {
            roomController.updateRoomCount(req, res, false).then(otherPlayerId => {
                props.updateVisibleRooms(null);
                props.updateOnlineGames(null)

                if (otherPlayerId) {
                    props.informGameAborted(req.body.myId);
                    props.informGameAborted(otherPlayerId);
                }
            });
        });
    app.route('/room/start/:id')
        .post((req, res) => {
            roomController.startGame(req, res).then(otherPlayerId => {
                props.informGameStarted(req.body.myId);
                props.informGameStarted(otherPlayerId);
            });
        });
    app.route('/rooms/active-count')
        .get(roomController.countActiveRooms)
    app.route('/rooms/played-count')
        .get(roomController.countPlayedGames)
};