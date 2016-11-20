'user strict'

import React, {
  Component
} from 'react';
import ReactNative, {
  Alert,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  View,
  TouchableOpacity,
  Linking
} from 'react-native';

const {height, width} = Dimensions.get('window');
import MaterialUI, {
  Card,
  Button,
} from 'react-native-material-design';
import UserStore from './../../store/user-store';
import Actions from './../../actions';

export default class CardView extends Component {
  constructor() {
    super();
    this.state = {
      likeBtnOpacity: 0.6,
      disLikeBtnOpacity: 0.6,
      likeCount: 0
    }
  }

  componentDidMount() {
    this.currentLocation = UserStore.currentPosition;
    this.setState({
      likeCount: this.props.upvotes-this.props.downvotes,
      likeBtnOpacity: this.props.uservote > 0 ? 1 : 0.6,
      disLikeBtnOpacity: this.props.uservote < 0 ? 1 : 0.6,
    })
  }

  _renderCardMedia() {
    return <Card.Media
      height={width-16}
      image={<Image source={{uri: this.props.image_url}} />}/>
  }

  _renderCardBody() {
    return <Card.Body>
      <Text>{this.props.description}</Text>
      </Card.Body>
  }

  _navigateGoogleMap(){
    var url = "http://maps.google.com/maps?daddr="+this.props.lat+","+this.props.lng;
    Linking.canOpenURL(url).then(supported => {
      if (!supported) {
        console.log('Can\'t handle url: ' + url);
      } else {
        return Linking.openURL(url);
      }
    }).catch(err => console.error('An error occurred', err));
  }

  _onLike() {
    console.log('Like pressed');
    Actions.makeVote(this.props.post_id, 1);
    this.setState({
      likeBtnOpacity: this.state.likeBtnOpacity < 1 ? 1 : 0.6, // Toggle the button
      disLikeBtnOpacity: 0.6, // At any case if like pressed this will be deactivated
      likeCount: this._calculateLikeCount(true)
    });
  }

  _onDisLike() {
    console.log('DisLike pressed');
    Actions.makeVote(this.props.post_id, -1);
    this.setState({
      disLikeBtnOpacity: this.state.disLikeBtnOpacity < 1 ? 1: 0.6, // Toggle the button
      likeBtnOpacity: 0.6, // At any case if dislike pressed this will be deactivated
      likeCount: this._calculateLikeCount(false)
    });
  }

  _calculateLikeCount(like) {
    if(this.state.disLikeBtnOpacity != 1 && this.state.likeBtnOpacity != 1){
      if (like) {
        return this.state.likeCount+1;
      } else {
        return this.state.likeCount-1;
      }
    } else if (this.state.disLikeBtnOpacity != 1) {
      if (like) {
        return this.state.likeCount-1;
      } else {
        return this.state.likeCount-2;
      }
    } else if (this.state.likeBtnOpacity != 1) {
      if (like) {
        return this.state.likeCount+2;
      } else {
        return this.state.likeCount+1;
      }
    }
  }

  _renderNavigationAction() {
    var km = Number(this.props.distance_in_kms).toFixed(2);
    if (km < 0.5) {
      var NavigateBtnTxt = 'look around';
    } else if (km < 1){
      var NavigateBtnTxt = (km*1000)+' mt walk';
    } else {
      var NavigateBtnTxt = km+' km away';
    }
    var navLogo = require('./../../../images/icon_meta_navigation.png');
    return <TouchableOpacity
      activeOpacity={0.4}
      style={styles.navBtnTouch}
      onPress={() => this._navigateGoogleMap()}>
        <View style={styles.navBtn}>
          <Image source={navLogo} style={styles.actionIcons}/>
          <Text style={styles.navBtnText}>{NavigateBtnTxt}</Text>
        </View>
    </TouchableOpacity>
  }

  _onDelete() {
    Alert.alert(
      'Delete',
      'Do you really want to delete it?',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Delete', onPress: () => this._onDeleteConfirm()},
      ]
    );
  }

  _onDeleteConfirm() {
    Actions.deletPost(this.props.post_id);
  }

  _onEdit() {
    this.props.openPostupdate(this.props);
  }

  _renderUserAction() {
    var likeLogo = require('./../../../images/icon_meta_like.png');
    var disLikeLogo = require('./../../../images/icon_meta_dislike.png');
    var deleteLogo = require('./../../../images/icon_delete.png');
    var editLogo = require('./../../../images/icon_edit.png');
    if (this.props.self) {
      return <View style={styles.actionBtnLessSpace}>
        <TouchableOpacity
        activeOpacity={0.4}
        style={styles.iconTouchable}
        onPress={() => this._onEdit()}>
          <Image source={editLogo} style={styles.actionIcons}/>
        </TouchableOpacity>
        <TouchableOpacity
        activeOpacity={0.4}
        style={styles.iconTouchable}
        onPress={() => this._onDelete()}>
          <Image source={deleteLogo} style={styles.actionIcons}/>
        </TouchableOpacity>
      </View>
    } else {
      return <View style={styles.actionBtn}>
        <TouchableOpacity
        activeOpacity={0.4}
        style={styles.iconTouchable}
        onPress={() => this._onDisLike()}>
          <Image source={disLikeLogo} style={[styles.dislikeLogo, {opacity: this.state.disLikeBtnOpacity}]}/>
        </TouchableOpacity>
        <Text style={styles.likeCount}>{this.state.likeCount}</Text>
        <TouchableOpacity
        activeOpacity={0.4}
        style={styles.iconTouchable}
        onPress={() => this._onLike()}>
          <Image source={likeLogo} style={[styles.likeLogo, {opacity: this.state.likeBtnOpacity}]}/>
        </TouchableOpacity>
      </View>
    }
  }
  _renderCardAction() {
    return  <View style={styles.cardActions}>
        {this._renderNavigationAction()}
        {this._renderUserAction()}
      </View>
  }

  render() {
    return <Card>
      {this._renderCardBody()}
      {this._renderCardMedia()}
      {this._renderCardAction()}
    </Card>
  }
}

const styles = StyleSheet.create({
    actionIcons: {
        height: 20,
        width: 20
    },
    navBtn: {
        flexDirection: 'row',
        width: 120,
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    actionBtn: {
        flexDirection: 'row',
        width: 100,
        justifyContent: 'space-around',
        alignItems: 'center'
    },

    actionBtnLessSpace: {
        flexDirection: 'row',
        width: 70,
        justifyContent: 'space-around',
        alignItems: 'center'
    },

    navBtnText: {
        color: '#FF0000',
        fontWeight: '700'
    },

    likeLogo: {
        height: 20,
        width: 20,
        marginBottom: 5,
    },
    dislikeLogo: {
        height: 20,
        width: 20,
        marginTop: 5,
    },
    iconTouchable: {
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardActions: {
        borderColor: '#000000',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    navBtnTouch: {
        height: 40,
        justifyContent: 'center',
    },
    likeCount: {
        color: 'rgb(3,169,244)',
        fontWeight: '500'
    }
})
