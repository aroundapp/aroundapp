import React, {
  Component
} from 'react';
import ReactNative, {
  AsyncStorage,
  Text,
  View,
  Image,
  StyleSheet,
  StatusBar
} from 'react-native';
import Reflux from 'reflux';
import FBSDK, {
  LoginButton,
  AccessToken
} from 'react-native-fbsdk';
import MaterialUI from 'react-native-material-design';
import Circle from './common/circle';
import Common from './../utils/common';
import API from './../utils/api';
import UserStore from './../store/user-store';
import Actions from './../actions';

export default class SignIn extends Component {

  constructor() {
    super();
    this.state = {
      hasFbToken: true,
      username: 'Loading ...',
      userIcon: require('./../../images/icon_login_user.png'),
      userIconStyle: styles.userIcon
    };
    this._loadInitialStates();
  }

  _loadInitialStates() {
    AsyncStorage.multiGet(['first_name', 'picture', 'app_token', 'device_id'])
    .then((data) => {
      this.first_name = data[0][1];
      this.picture = data[1][1];
      this.app_token = data[2][1];
      this.device_id = data[3][1];
      this.setState({
        hasFbToken: this.app_token == null ? false : true,
      });
      if (this.device_id !== null && this.app_token !== null) {
        let params = {
          device_id: this.device_id,
          token: this.app_token
        }

        // Updating user info
        // Verifying login
        API.verifyLogin(params)
        .then((data) => {
          console.log("Verify login response", data);
          this.setState({
            username: 'Welcome back '+data.user.first_name,
            userIcon: {uri: data.user.picture},
            userIconStyle: styles.userIconPhoto
          });
          Actions.saveUserInfo(data);
          // this._openFeed();
        })
        .catch((error) => {
          console.log("Verify login error", error);
          this.setState({
            hasFbToken: false,
            username: 'Loading ...',
            userIcon: require('./../../images/icon_login_user.png'),
            userIconStyle: styles.userIcon
          });
        })
      }   
    });
  }

  _handleFbLogin(error, result) {
    if (error) {
      console.log("Login failed with error: " + result.error);
    } else if (result.isCancelled) {
      console.log("Login was cancelled");
    } else {
      console.log("Login was successful with permissions: " + result.grantedPermissions)
      AccessToken.getCurrentAccessToken().then((data) => {
        const { accessToken } = data;
        this._onFbLogin(accessToken);
      })
    }
  }

  _onFbLogin(fbToken) {
    if (fbToken != null) {
      AsyncStorage.setItem('fb_token', fbToken);
      this.setState({hasFbToken: true});
      AsyncStorage.getItem('device_id')
        .then((deviceId) => {
          // Set the device id for the first time
          // when it's null
          if (deviceId == null) {
            deviceId = Common.getUUID();
            AsyncStorage.setItem('device_id', deviceId);
          }
          let params = {
            'fb_token': fbToken,
            'device_id': deviceId,
            'device_name': 'test'
          }
          API.signUp(params)
            .then((data) => {
            console.log("Signup response", data);
            AsyncStorage.multiSet([
              ['first_name', data.user.first_name],
              ['last_name', data.user.last_name],
              ['picture', data.user.picture],
              ['app_token', data.token],
            ]);
            this.setState({
              username: 'Welcome '+data.user.first_name,
              userIcon: {uri: data.user.picture},
              userIconStyle: styles.userIconPhoto
            })
            Actions.saveUserInfo(data);
            // this._openFeed();
          });
        });
    }
  }

  _renderCircles() {
    let circles = [];
    let initSize = 7;
    for (let i=0; i<5; i++) {
      circles.push(<Circle size={initSize++} key={i+1} />);
    }
    return <View style={styles.circleGroup}>
      {circles}
    </View>;
  }

  _renderFbConnect() {
        if (!this.state.hasFbToken) {
            return <View style={styles.fbBtnStyle}>
                    <LoginButton 
                      readPermissions={['public_profile', 'email']}
                      onLoginFinished={(error, result) => this._handleFbLogin(error, result)}
                      onLogoutFinished={() => console.log("User logged out")}/>
                    </View>
        } else {
            return <Text>{this.state.username}</Text>;
        }
    }

  _renderFbConnectHelperText() {
    return <Text style={styles.smallText}>
              You need to connect with us before you can post anything
          </Text>;
  }

  _renderPhotoIcon() {
    return <Image
        source={require('./../../images/icon_login_placeholder.png')}
        style={styles.photoIcon}/>;
  }

  _renderStatusBar() {
    return <StatusBar
        backgroundColor="#0B89BF"
        barStyle="light-content"/>
  }

  _renderUserIcon() {
    return <Image
            source={this.state.userIcon}
            style={this.state.userIconStyle}/>;
  }

  render() {
    return <View style={styles.mainContainer}>
      {this._renderStatusBar()}
      {this._renderPhotoIcon()}
      {this._renderCircles()}
      {this._renderUserIcon()}
      {this._renderFbConnectHelperText()}
      {this._renderFbConnect()}
    </View>;
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center'
  },
  photoIcon: {
    height: 80,
    width: 80,
    marginTop: 60
  },

  circleGroup: {
    marginTop: 35,
    height: 100,
    justifyContent: 'space-around'
  },

  userIcon: {
    height: 50,
    width: 60,
    resizeMode: 'stretch',
    marginTop: 25
  },

  userIconPhoto: {
    height: 70,
    width: 70,
    borderRadius: 35,
    marginTop: 25
  },

  smallText: {
    fontFamily: 'Open Sans',
    fontWeight: '400',
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 50
  },

  fbBtnStyle: {
    marginTop: 10,
  }
});