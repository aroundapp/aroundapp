'user strict'

import React, {
  Component
} from 'react';
import ReactNative, {
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';

const {height, width} = Dimensions.get('window');

export default class Loading extends Component {
  text = 'Loading ...';
  overlay = false;
  overlayHeight = height;
  overWidth = width;
  inLine = false;

  componentWillMount() {
    this.text = this.props.text || this.text;
    this.overlay = this.props.overlay || this.overlay;
    this.overlayHeight = this.props.overlayHeight || this.overlayHeight;
    this.overWidth = this.props.overWidth || this.overWidth;
    this.inLine = this.props.inLine || this.inLine;
  }

  render() {
    let extraStyle = {};
    let textStyle = {};
    if(this.props.overlay){
      extraStyle = {
        height: this.props.overlayHeight,
        width: this.props.overlayWidth,
        backgroundColor: 'rgba(1,1,1,0.7)',
        margin: 0
      };
      textStyle = {
        color: '#FFFFFF'
      }
    }
    if(this.props.inLine){
      extraStyle = {
        flexDirection: 'row',
        margin: 0
      };
    }
    return <View style={[styles.viewStyle, extraStyle]}>
            <Image source={require('./../../../images/loading.gif')}
            style={styles.loaderStyle}/>
            <Text style={[textStyle]}>{this.props.text}</Text>
          </View>
  }
}

const styles = StyleSheet.create({
  loaderStyle : {
    height:20,
    width: 20,
    margin:5
  },
  viewStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 15
  }
});
