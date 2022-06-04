module.exports = function (mongoose) {
    return mongoose.model('Room', new mongoose.Schema({
        name: String,
        player: Boolean,  //starting player: false = roomHost, true = opponent
        status: Number, //room status: 0 = new, 1 = full, 2 = game started, 3 = game ended, 4 = closed, 5 = aborted
        playerCount: Number,
        player0: String,
        player1: String
    }));
}