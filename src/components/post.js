'user strict'

import React, { Component } from 'react';
import ReactNative, {
  Text,
  View,
  Image,
  Dimensions,
  StyleSheet,
  ImageEditor,
  TextInput,
  BackAndroid,
  ScrollView
} from 'react-native';
import Reflux from 'reflux';

import Camera from 'react-native-camera';
import ImageResizer from 'react-native-image-resizer';

import MaterialUI, {
  Button as Btn
} from 'react-native-material-design';

import API from './../utils/api';
import Actions from './../actions';
import CommonStyles from './common/styles';
import FloatBtn from './common/floatbtn';
import Header from './common/header';
import Loading from './common/loading';
import PostStore from './../store/post-store';
import UserStore from './../store/user-store';

const {height, width} = Dimensions.get('window');

export default class Post extends Component {

  imageUri = '';
  imageUploaded = '';
  currentPosition = '';
  alertShown = '';
  imagename = '';

  constructor() {
    super()
    this.state = {
      imgUrl: null,
      text: '',
      remaining: 80,
      textEditable: false,
      overLayShow: false,
      textInpHeight: 40,
      allowPublish: false,
      gotLocation: false,
      posting: false,
      updatepost: false
    }
  }

  componentDidMount() {
    // Create post
    if(typeof(this.props.navigator.postDetails) == 'undefined') {
      Actions.getLocationInfo();
      Actions.getUserInfo();
    }
    // Update post
    else {
      this.postDetails = this.props.navigator.postDetails;
      let descLen = this.postDetails.description.length;
      this.setState({
        imgUrl: {uri: this.postDetails.image_url},
        text: this.postDetails.description,
        textEditable: true,
        allowPublish: true,
        updatepost: true,
        gotLocation: true,
        remaining: this.state.remaining-descLen,
        textInpHeight: descLen <= 55 ? 40 : 60
      });
    }
    this.onUpdateComplete();
    this.onPostUpdate();
  }

  componentWillUnmount() {
    delete this.props.navigator.postDetails;
    this.postStoreUnsubscribe();
    this.userStoreUnsubscribe();
  }

  onUpdateComplete(){
    this.userStoreUnsubscribe = UserStore.listen((event, data) => {
      if (event == 'userinfo') {
        this.token = data.token;
      }
      if(event == 'locationinfo') {
        this.currentPosition = data;
        this.setState({gotLocation: true});
      }
    });
  }

  onPostUpdate(){
    this.postStoreUnsubscribe = PostStore.listen((event, data) => {
      if (event == 'addpostsuccess' || event == 'postupdatesuccess') {
        this.setState({posting: false})
        this.props.navigator.pop();
      }
      if (event == 'addpostfailure') {
        this.setState({
          posting: false,
          allowPublish: false
        })
      }
    });
  }

  /**
  * Render helper action functions
  **/
  _onBackPress(){
    this.props.navigator.pop();
  }

  _onPublishBtnPress() {
    // Create new post
    if (!this.state.updatepost){
      if(this.state.allowPublish && this.state.gotLocation && this.state.text.length) {
        this.setState({
          allowPublish: false,
          posting: true
        });
        let params = {
          token:  this.token,
          imagename: this.imagename,
          lat_lng: this.currentPosition.latitude+','+this.currentPosition.longitude,
          description: this.state.text
        };
        Actions.postImage(params);
      }
    } else {
      this.setState({
        allowPublish: false,
        posting: true
      });
      let params = {
        description: this.state.text
      };
      Actions.updatePost(this.postDetails.post_id, params);
    }
  }


  _onChange(text) {
    if (text.length <= 80){
      this.setState({
        text: text,
        remaining: 80-text.length,
        textInpHeight: text.length <= 55 ? 40 : 60
      });
    }
  }

  _onStartEditing(){
    if (!this.imageUploaded && !this.state.updatepost) {
      this.imageUploaded = true;
      this._handleImageUpload();
    }
  }

  _handleImageUpload() {
    this.setState({
      overLayShow: true,
      allowPublish: false
    });
    this._resizeImage(this.imageUri, (uri) => {
      let token = this.token;
      let time = new Date();
      let name = time.getTime()+'.jpg';
      let imageData = {
        type: 'image/jpeg',
        uri: 'file://'+ uri,
        name: name
      };
      let params = {
        image: imageData,
        token: token
      };
      API.uploadImage(params)
      .then((data) => {
        this.setState({
          overLayShow: false,
          allowPublish: true
        });
        console.log('Image upload response', data);
        this.imagename = data.imagename;
      })
    });
  }

  _resizeImage(uri, callback) {
    ImageResizer.createResizedImage(uri, 1000, 1000, 'JPEG', 90)
    .then(function(resizedImageUri){
      console.log(resizedImageUri);
      callback(resizedImageUri);
    })
    .catch(function(e){
      console.log(e);
    })
  }

  takePicture() {
    if (this.state.imgUrl == null) {
      this.refs.camRef.capture()
      .then((data) => {
        console.log('Clicked image', data);
        this.setState({
          imgUrl: {uri: data.path},
          textEditable: true
        });
        this.imageUri = data.path;
        if (this.imageUploaded){
          this._handleImageUpload();
        }
      })
      .catch(function(err) {
        console.log(err);
      })
    } else {
      this.setState({
        imgUrl: null,
        textEditable: true
      });
    }
  }

  /**
  * Render functions
  * These are helper functions of main render method
  **/

  _renderCamPic(){
    if (this.state.imgUrl == null) {
      return <Camera
        ref="camRef"
        style={styles.preview}
        aspect={'fill'}
        orientation={Camera.constants.Orientation.auto}
        captureTarget={Camera.constants.CaptureTarget.disk}
        captureQuality={Camera.constants.CaptureQuality.high}/>
    } else {
      let Loader = <View></View>
      if(this.state.overLayShow) {
        Loader = <Loading text={'Uploading image ..'}
        overlay={true}
        overlayHeight={width}
        overlayWidth={width}/>
      }
      return <Image
        style={styles.preview}
        source={this.state.imgUrl}>
        {Loader}
      </Image>
    }
  }

  _renderFloatingBtn(){
    if (!this.state.updatepost){
      return <FloatBtn
        btnstyle={styles.camBtnStyle}
        img={require('./../../images/camera.png')}
        onPress={() => this.takePicture()}/>
    }
  }

  _renderTextSection() {
    let txtInpStyle = {fontSize: 15, height: this.state.textInpHeight};
    return <View style={styles.textWrap}>
      <Text style={styles.remaining}>{this.state.remaining}</Text>
      <TextInput
        style={txtInpStyle}
        onChangeText={(text) => this._onChange(text)}
        value={this.state.text}
        multiline={true}
        underlineColorAndroid={'#03A9F4'}
        maxLength={80}
        placeholder={'Say something interesting...'}
        autoCapitalize={'sentences'}
        editable={this.state.textEditable}
        onFocus={() => this._onStartEditing()}
      />
      </View>
  }

  _renderPublishBtn(){
    let overRides = {
      textColor: '#FFFFFF',
      backgroundColor: '#02AAF2',
      rippleColor: '#0B89BF'
    };
    return <Btn 
      text={this.state.updatepost?'SAVE':'PUBLISH'}
      raised={true}
      overrides={overRides}
      loading={this.state.posting}
      disabled={(!this.state.allowPublish && !this.state.posting) || !this.state.gotLocation || !this.state.text.length}
      onPress={() => this._onPublishBtnPress()}/>
  }

  _renderGettingLocationLoader() {
    if(this.state.gotLocation && !this.state.posting){
      return <View></View>
    } else {
      if(!this.state.gotLocation) {
        return <Loading text={'Getting location..'} inLine={true} />
      } else if (this.state.posting) {
        return <Loading text={'Hang on a sec..'} inLine={true} />
      }
    }
  }

  /**
  * Main render function
  **/

  render() {
    return <ScrollView style={CommonStyles.mainView}>
        <Header onBack={() => this._onBackPress()}/>
        <View style={CommonStyles.mainContainer}>
          {this._renderCamPic()}
          {this._renderFloatingBtn()}
          {this._renderTextSection()}
          {this._renderPublishBtn()}
          {this._renderGettingLocationLoader()}
        </View>
      </ScrollView>
  }

}

const styles = StyleSheet.create({
    imageContainer: {
        height: width,
        resizeMode: 'contain',
        backgroundColor: '#02AAF2'
    },
    preview: {
        height: width,
        width: width,
        backgroundColor: '#000000'
    },

    camBtnStyle: {
        height: 80,
        width: 80,
        borderRadius: 40,
        backgroundColor: '#34D399',
        borderColor: '#FFFFFF',
        borderWidth: 5,
        top: width-45,
        left: width-110
    },

    textWrap: {
        marginTop: 10
    },

    overLayShow: {
        width: width,
        height: width,
        backgroundColor: 'rgba(1,1,1,0.7)',
        alignItems: 'center',
        justifyContent: 'center'
    },

    overLayHide: {
        height: 0
    },
    remaining: {
        marginLeft: 4,
        borderWidth: 0,
        borderColor: '#000000'
    },

})
