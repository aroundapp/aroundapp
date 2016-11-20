'user strict'

var Reflux = require('reflux');

var ImageStore = Reflux.createStore({
    imgSource: '',
    saveImage: function(source) {
        this.imgSource = source;
    },
});

module.exports = ImageStore;
