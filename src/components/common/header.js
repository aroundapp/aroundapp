'user strict'

import React, { Component } from 'react';
import ReactNative, {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ToolbarAndroid
} from 'react-native';

let {height, width} = Dimensions.get('window');

export default class Header extends Component {
  defaultProps() {
    return {
      onBack: null
    }
  }

  render() {
    let toolBar = <ToolbarAndroid
      title={"Around"}
      titleColor={"#FFFFFF"}
      style={styles.header} />;

    if (typeof(this.props.onBack) == 'function'){
      toolBar = <ToolbarAndroid
        navIcon={require('./../../../images/arrowleft.png')}
        onIconClicked={() => this.props.onBack()}
        title={"Around"}
        titleColor={"#FFFFFF"}
        style={styles.header} />
    }

    return <View>
      <StatusBar
        backgroundColor="#0B89BF"
        barStyle="light-content"/>
        {toolBar}
      </View>
  }
}

const styles = StyleSheet.create({
    header: {
        width: width,
        height: 55,
        backgroundColor: '#02AAF2',
        borderWidth: 1
    }
});
