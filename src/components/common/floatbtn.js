'user strict'

import React, {
  Component
} from 'react';
import ReactNative, {
  Image,
  TouchableHighlight,
  View,
  StyleSheet,
  Dimensions
} from 'react-native';
import TouchableWithoutFeedback from 'TouchableWithoutFeedback';

let {height, width} = Dimensions.get('window');


export default class FloatBtn extends Component {
  img = require('./../../../images/icon_fab.png');
  btnstyle = {};
  underlay = '#0181B7';
  onPress = ()=>{};

  constructor(){
    super();
    this.state = {
      elevation: 6
    }
  }

  componentWillMount() {
    this.img = this.props.img || this.img;  
    this.btnstyle = this.props.btnstyle || this.btnstyle;  
    this.underlay = this.props.underlay || this.underlay;  
    this.onPress = typeof(this.props.onPress) == 'function' ? this.props.onPress : this.onPress;  
  }

  _handlePress() {
    this.setState({elevation: 6});
    this.onPress();
  }

  _handlePressIn() {
    this.setState({elevation: 0});
  }

  render() {
    return  <TouchableWithoutFeedback
        onPressOut={() => this._handlePress()}
        onPressIn={() => this._handlePressIn()}>
          <View
          style={[styles.floatBtn, this.btnstyle]}
          elevation={this.state.elevation}>
            <Image
            source={this.img}
            style={styles.imgStyle}/>
          </View>
        </TouchableWithoutFeedback>
  }
} 

const styles = StyleSheet.create({
    floatBtn: {
        position: 'absolute',
        backgroundColor: '#03A9F4',
        borderColor: '#06A2E5',
        borderRadius: 35,
        height: 70,
        width: 70,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        top: height - 125,
        left: width - 95
    },
    test: {
        backgroundColor: '#000000',
    },
    imgStyle: {
        height: 30,
        resizeMode: 'contain'
    }
});
