'user strict'

var Reflux = require('reflux');
var Actions = require('./../actions');
var UserStore = require('./user-store');
var API = require('./../utils/api');

var PostStore = Reflux.createStore({
    listenables: [Actions],
    fetchedIds : [],
    posts: [],

    /* Action functions */
    getPosts: function(timestamp, when){
        if (typeof(when) == 'undefined'){
            when = 'before';
        }
        var params = {
            token    : UserStore.userInfo.token,
            lat_lng  : UserStore.currentPosition.latitude+','+UserStore.currentPosition.longitude,
            timestamp: timestamp,
            when     : when
        };
        if (this.fetchedIds.length){
            params.not_ids = this.fetchedIds.join();
        }
        console.log('GET posts params', params);
        API.getPosts(params)
        .then(function(data) {
            console.log(data);
            if(data.posts.length){
                this.processPosts(data.posts, when);
            } else {
                if (when == 'before') {
                    this._triggerNoPostFound();
                } else {
                    this._triggerNoPostFoundOnRefresh();
                }
            }
        }.bind(this))
        .catch(function(err){
            console.log('Error : ', err);
        }.bind(this))
    },

    postImage: function(params) {
        API.postImage(params)
        .then(function(data){
            console.log(data);
            this.posts.unshift(data);
            this.fetchedIds.push(data.post_id);
            this._triggerPostUpdate();
            this._triggerPostAddSuccess();
        }.bind(this))
        .catch(function(err) {
            console.log(err);
            this._triggerPostAddFailure();
        })
    },

    deletPost: function(post_id) {
        var params = {
            token : UserStore.userInfo.token,
        }
        API.deletePost(post_id, params)
        .then(function() {
            this._removeDeletedPostFromArray(post_id);
            this._triggerDeleteSuccess();
        }.bind(this))
        .catch(function(err){
            console.log(err);
        })
    },

    updatePost: function(post_id, params) {
        params.token = UserStore.userInfo.token;
        API.updatePost(post_id, params)
        .then(function() {
            for(var i = 0; i < this.posts.length; i++) {
                if (this.posts[i].post_id == post_id) {
                    this.posts[i].description = params.description;
                    break;
                }
            }
            this._triggerUpdatePostSuccess();
        }.bind(this))
        .catch(function(err){
            console.log(err);
        })
    },

    isBusy: false,
    queue: [],
    makeVote: function(post_id, vote, fromQueue) {
        console.log('hello');
        fromQueue = typeof(fromQueue)=='undefined' ? false : true;
        if (this.isBusy && !fromQueue) {
            this.queue.unshift([post_id, vote]);
        } else {
            this.makeVoteApi(post_id, vote);
        }
    },

    makeVoteApi: function(post_id, vote) {
        this.isBusy = true;
        var params = {
            token: UserStore.userInfo.token,
            post_id: post_id,
            vote: vote
        };
        API.like(params)
        .then(function(data) {
            console.log('Sending req');
            this.isBusy = this.queue.length ? true : false;
            if (this.isBusy){
                var next = this.queue.pop();
                console.log("Giving next");
                this.makeVoteApi(next[0], next[1], true)
            }
            console.log(data);
        }.bind(this))
        .catch(function(err){
            console.log(err);
        }.bind(this))
    },

    /* Helper functions */

    processPosts: function(posts, when) {
        for(var i=0; i<posts.length; i++){
            // checking already fetched or not
            // Concurrecy problem need to figure out a better solution
            if(this.fetchedIds.indexOf(posts[i].post_id)<0){
                if(when == 'after'){
                    this.posts.unshift(posts[i]);
                    this.fetchedIds.unshift(posts[i].post_id);
                } else {
                    this.posts.push(posts[i]);
                    this.fetchedIds.push(posts[i].post_id);
                }
            }
        }
        console.log(this.fetchedIds);
        this._triggerPostUpdate();
    },

    _removeDeletedPostFromArray: function(post_id){
        for(var i = this.posts.length; i--;){
            if (this.posts[i].post_id === post_id) this.posts.splice(i, 1);
        }
    },

    /* Trigger functions */

    _triggerPostUpdate: function(){
        this.trigger('postupdate', this.posts);
    },

    _triggerNoPostFound: function() {
        var msg = '';
        if (this.posts.length){
            msg = 'No more things happening nearby..';
        } else {
            msg = 'No post found nearby. Start posting and build the community around you.';
        }
        this.trigger('nopostfound', msg);
    },

    _triggerNoPostFoundOnRefresh: function() {
        this.trigger('nopostfoundonrefresh')
    },

    _triggerPostAddSuccess: function(){
        this.trigger('addpostsuccess')
    },
    _triggerPostAddFailure: function(){
        this.trigger('addpostfailure')
    },
    _triggerDeleteSuccess: function() {
        this.trigger('postdeletesuccess', this.posts);
    },
    _triggerUpdatePostSuccess: function() {
        this.trigger('postupdatesuccess', this.posts);
    }
});

module.exports = PostStore;
