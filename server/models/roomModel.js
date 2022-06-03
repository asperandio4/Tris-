module.exports = function (mongoose) {
    return mongoose.model('Room', new mongoose.Schema({
        name: String,
        player: Boolean,
    }));
}