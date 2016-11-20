'user strict'

import React, { Component } from 'react';
import {
  AsyncStorage,
  Text,
  View,
  Image,
  Navigator
} from 'react-native';

import SignIn from './components/signin';
import Feeds from './components/feed';
import UserStore from './store/user-store';
import Actions from './actions';

const Routes = {
  signin: SignIn,
  feeds: Feeds
}

export default class Around extends Component {
  
  componentWillMount() {
    Actions.getLocation();
  }

  componentWillUnmount() {
    // Clearing the gps location tracker
    navigator.geolocation.clearWatch(this.watchID);
  }

  renderScene(route, navigator) {
    let Component = Routes[route.name];
    return <Component
              route={route}
              navigator={navigator} />;
  }

  render() {
    return <Navigator
                configureScene={
                  (route, routeStack) =>
                    Navigator.SceneConfigs.FloatFromRight
                  }
                initialRoute={{name: 'signin'}}
                renderScene={this.renderScene} />
  }
}
