module.exports = function (app, props) {
    app.route('/').get((req, res) => res.send({response: "I am alive"}).status(200));

    let roomController = require('../controllers/roomController');
    app.route('/rooms')
        .get(roomController.listRooms)
        .post((req, res) => {
            roomController.addRoom(req, res);
            props.updateVisibleRooms(null);
        });
    app.route('/room/:id')
        .get(roomController.getRoom)
    //.put(roomController.updateRoom)
    //.delete(roomController.deleteRoom);
};