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

const Routes = {
  signin: SignIn 
}

export default class Around extends Component {
  
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
