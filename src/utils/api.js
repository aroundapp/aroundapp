'user strict'

var Common = require('./common');
var API_BASE = 'http://api.snapytag.in/';

var API = {
    signUp: function(params){
        var endPoint = 'signup';
        return this.callApi(endPoint, 'POST', params);
    },

    verifyLogin: function(params) {
        var endPoint = 'verifylogin';
        return this.callApi(endPoint, 'POST', params);
    },

    uploadImage: function(params) {
        var endPoint = 'uploadimage';
        return this.callApi(endPoint, 'PUT', params);
    },

    postImage: function(params){
        var endPoint = 'posts';
        return this.callApi(endPoint, 'POST', params);
    },

    getPosts: function(params){
        var endPoint = 'posts';
        return this.callApi(endPoint, 'GET', params);
    },

    like: function(params) {
        var endPoint = 'like';
        return this.callApi(endPoint, 'POST', params);
    },

    deletePost: function(post_id, params) {
        var endPoint = 'posts/'+post_id;
        return this.callApi(endPoint, 'DELETE', params);
    },

    updatePost: function(post_id, params) {
        var endPoint = 'posts/'+post_id;
        return this.callApi(endPoint, 'PUT', params);
    },

    callApi: function(endpoint, method, params) {
        var url = API_BASE + endpoint;
        if (method == 'POST' || method == 'PUT' || method == 'DELETE') {
            var formData = new FormData();
            for (var key in params) {
                if(params.hasOwnProperty(key)) {
                    console.log(key);
                    console.log(params[key]);
                    formData.append(key, params[key]);
                }
            }
            return fetch(url,{
                method: method,
                body: formData,
            })
            .then(function(response){
                return response.json();
    		})
            .then(function(json){
                return json;
    		})
        } else if(method == 'GET') {
            var getUrl = [];
            for (var key in params) {
                if(params.hasOwnProperty(key)) {
                    getUrl.push(key+'='+params[key]);
                }
            }
            getUrl = getUrl.join('&');
            url = url+'?'+getUrl;
            console.log(url);
            return fetch(url)
            .then(function(response){
                return response.json();
    		})
            .then(function(json){
                return json;
    		})
        }
    }
};

module.exports = API;