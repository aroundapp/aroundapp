'user strict'

var Reflux = require('reflux');
var Actions = require('./../actions');

var UserStore = Reflux.createStore({
    listenables: [Actions],
    userInfo: {},
    currentPosition: {},
    firstFetchComplete: false,
    saveUserInfo: function(data) {
        this.userInfo = data;
    },

    getUserInfo: function() {
        this._triggerUserInfo();
    },

    // Only for the first time getting loc
    // While sign in
    _setCurrentPos: function(currentPosition) {
        this.currentPosition = currentPosition;
        this._triggerLocationInfo();
    },

    // Should only be called from signin page
    getLocation: function(alertShown) {
        if (typeof(alertShown) == 'undefined') {
            alertShown = false;
        }
        navigator.geolocation.getCurrentPosition(
            function(position){
                console.log(position);
                if(!this.firstFetchComplete){
                    this.firstFetchComplete = true;
                    this._setCurrentPos(position.coords);
                } else {
                    this._updateLocation(position.coords);
                }
            }.bind(this),
            function(error){
                console.log(error);
                if(!alertShown){
                    alert('Please turn on location from settings.');
                }
                setTimeout(function(){
                    this.getLocation(true);
                }.bind(this), 4000);
            }.bind(this),
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );

        this.watchID = navigator.geolocation.watchPosition(function(position){
            console.log(position);

            // Section should be removed
            setTimeout(function(){
                if(!this.firstFetchComplete){
                    this.firstFetchComplete = true;
                    this._setCurrentPos(position.coords);
                }
            }.bind(this), 5000);

            this._updateLocation(position.coords);
        }.bind(this));
    },

    _updateLocation: function(currentPosition){
        this.currentPosition = currentPosition;
    },

    getLocationInfo: function(){
        console.log('Current pos', this.currentPosition);
        this._triggerLocationInfo();
    },

    _triggerAllUpdated: function(){
        this.trigger('allupdated', this.userInfo, this.currentPosition);
    },
    _triggerUserInfo: function() {
        this.trigger('userinfo', this.userInfo);
    },
    _triggerLocationInfo: function() {
        if(this.firstFetchComplete){
            this.trigger('locationinfo', this.currentPosition);
        }
    }
});

module.exports = UserStore;
