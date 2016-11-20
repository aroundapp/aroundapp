'user strict'

import React, { 
  Component
} from 'react';
import ReactNative, {
    Text,
    View,
    StyleSheet
} from 'react-native';

export default class Circle extends Component {
  
  size = 20;
  bgcolor = '#A5A5A5';
  margin = 5;

  componentWillMount() {
    this.styles = {
      height: this.props.size ? this.props.size : this.size,
      width: this.props.size ? this.props.size : this.size,
      backgroundColor: this.props.bgcolor ? this.props.bgcolor : this.bgcolor,
      borderRadius: this.props.size ? this.props.size/2 : this.size/2,
      margin: this.props.margin ? this.props.margin : this.margin
    };
  }

  render() {
    return <View style={this.styles}/>;
  }
}