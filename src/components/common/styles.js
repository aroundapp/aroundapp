'user strict'

import ReactNative, {
  StyleSheet,
  Dimensions
} from 'react-native';

const {height, width} = Dimensions.get('window');

const CommonStyles = StyleSheet.create({
    mainContainer: {
    },
    mainView: {
        flex: 1,
    },
});

module.exports = CommonStyles;
