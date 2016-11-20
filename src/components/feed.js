'user strict'

import React, {
  Component
} from 'react';
import ReactNative, {
  AsyncStorage,
  Text,
  View,
  StyleSheet,
  Dimensions,
  ListView,
  RefreshControl
} from 'react-native';
import Reflux from 'reflux';
import Moment from 'moment-timezone';

import FloatBtn from './common/floatbtn';
import Header from './common/header';
import CommonStyles from './common/styles';
import Card from './common/card';
import Loading from './common/loading';
import PostStore from './../store/post-store';
import UserStore from './../store/user-store';
import Actions from './../actions';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

const {height, width} = Dimensions.get('window');

export default class Feeds extends Component {
  constructor() {
    super();
    this.state = {
      posts: ds.cloneWithRows([]),
      doneFetchingPosts: false,
      doneFetchingGps: false,
      loadingtext: 'Fetching..',
      generalmsg: '',
      isRefreshing: false,
      refreshEnable: false
    };
  }

  componentDidMount() {
    this.setState({
      doneFetchingGps: false,
      loadingtext: 'Fetching location...'
    });
    console.log('Trying to get the location to fetch posts nearby');
    Actions.getLocationInfo();
    this.currTime = Moment().tz('UTC').format('YYYY-MM-DD HH:mm:ss');
    this.listenToPostStore();
    this.listenToUserStore();
  }
  
  listenToPostStore() {
    PostStore.listen((event, data) => {
      if(event == 'postupdate'){

        // At least one post found flag
        this.postFound = true;
        console.log('Post found');
        console.log(data);
        this.setState({
          doneFetchingPosts: true,
          posts: ds.cloneWithRows(data),
          generalmsg: '',
          isRefreshing: false,
          refreshEnable: true
        });
      }

      if (event == 'nopostfound') {
        console.log('post not found');
        this.setState({
          generalmsg: data,
          doneFetchingPosts: true,
        });
      }

      if (event == 'nopostfoundonrefresh') {
        this.setState({
          isRefreshing: false
        });
      }

      if (event == 'postdeletesuccess' || event == 'postupdatesuccess') {
        console.log(data);
        this.setState({
          posts: ds.cloneWithRows(data)
        })
      }
    });
  }

  listenToUserStore() {
    UserStore.listen((event, data) => {
      if(event == 'locationinfo'){
        // So that this event doesn't fetch post when it's not in
        // Feeds page
        // Need to find out a better solution
        var currentRoutes = this.props.navigator.getCurrentRoutes();
        if (currentRoutes[currentRoutes.length-1].name == 'feeds'){
          this.setState({
            doneFetchingGps: true,
            loadingtext: 'Looking for posts nearby...'
          });
          Actions.getPosts(this.currTime);
        }
      }
    })
  }

  _onAddPostBtnPress() {
    // this.props.navigator.push({name: 'post'});
  }

  _renderPost(post){
    return <Card {...post} 
      openPostupdate={(post) => this.openPostupdate(post)} 
      key={post.post_id} />
  }

  _endReached(event){
    if (typeof(event) != 'undefined') {
      this.setState({
        doneFetchingPosts: false,
        loadingtext: 'Fetching posts...',
        generalmsg: ''
      });
      Actions.getPosts(this.currTime);
    }
  }

  _renderFooter(){
    if(this.state.doneFetchingPosts && this.state.doneFetchingGps){
      return <View style={styles.cardFooterStyle}>
                <Text>{this.state.generalmsg}</Text>
            </View>;
    } else {
      return <Loading text={this.state.loadingtext}/>;
    }
  }

  _onRefresh(){
    this.setState({isRefreshing: true})
    Actions.getPosts(this.currTime, 'after');
  }

  openPostupdate(postDetails) {
    // this.props.navigator.postDetails = postDetails;
    // this.props.navigator.push({name: 'post'});
  }

  render() {
    return <View style={styles.mainContainer}>
              <Header />
              <RefreshControl
                style={styles.layout}
                refreshing={this.state.isRefreshing}
                onRefresh={() => this._onRefresh()}
                colors={['#399FDA', '#2189C6', '#1279B5']}
                progressBackgroundColor={'#FFFFFF'}
                enabled={this.state.refreshEnable}>

                <ListView style={CommonStyles.mainContainer}
                  enableEmptySections={true}
                  dataSource={this.state.posts}
                  renderRow={(post) => this._renderPost(post)}
                  renderFooter={() => this._renderFooter()}
                  initialListSize={10}
                  pageSize={3}
                  onEndReached={(e) => this._endReached(e)}/>
              </RefreshControl>
            <FloatBtn onPress={() => this._onAddPostBtnPress()} />
          </View>
  }
}


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  cardFooterStyle: {
    height:20,
    margin: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  layout: {
    flex: 1
  }
});