module.exports = function (mongoose) {
    return mongoose.model('Room', new mongoose.Schema({
        name: String,
        startingPlayer: Boolean, //starting player: false = roomHost, true = opponent
        player: Boolean, //current player: false = roomHost, true = opponent
        status: Number, //room status: 0 = new, 1 = full, 2 = game started, 3 = game ended, 4 = closed, 5 = aborted
        playerCount: Number,
        player0: String,
        player1: String,
        values: Array,  //[0..8] array with 2 (not set), 1 (cross) and 0 (circle) values
        winner: String,
        victoryPos: String,
        matchNum: Number,  //number of the match, 0 if the first, more if it's a rematch
    }));
}