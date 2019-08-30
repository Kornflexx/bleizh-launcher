import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import {
  Text,
  View,
  StatusBar,
  Dimensions,
  StyleSheet,
  findNodeHandle,
  Alert,
  ScrollView
} from 'react-native'


const { width, height } = Dimensions.get('window')

class SimpleView extends Component {
  
  mainScrollView = createRef()
  drawerScrollView = createRef()
  drawerHeader = createRef()
  container = createRef()

  closeDrawer = () => {
    this.mainScrollView.current.scrollTo({
      y: 0,
      animated: true
    })
  }
  
  openDrawer = () => {
    this.mainScrollView.current.scrollTo({
      y: height - 80,
      animated: true
    })
  }

  handleDrawerScrollEnd = (velocity, contentOffset) => {
    const forced = Math.abs(velocity.y) > 1
    const open = contentOffset.y > (height - 80) / 2
    if (forced) {
      velocity.y < 0 ? this.openDrawer() : this.closeDrawer()
    } else {
      open ? this.openDrawer() : this.closeDrawer()
    }
  }

  handleScrollEndDrag = ({ nativeEvent }) => {
    const { velocity, contentOffset } = nativeEvent
    this.handleDrawerScrollEnd(velocity, contentOffset)
  }

  handleNestedScrollEndDrag = ({ nativeEvent }) => {
    this.drawerScrollView.current.getNativeScrollRef().measure((...args) => {
      const y = args[5]
      if (y <= 80 + StatusBar.currentHeight) return
      const contentOffset = {
        y: height - 80 - y
      }
      this.handleDrawerScrollEnd(nativeEvent.velocity, contentOffset)
    //const { velocity, contentOffset } = nativeEvent
    })
    //if (nativeEvent.contentOffset.y > 6) return;
    //const { velocity, contentOffset } = nativeEvent
  }

  render() {
    return (
      <View
        ref={this.container}
        style={styles.container}
      >
        <StatusBar translucent backgroundColor='#205cb2' />
        <ScrollView
          ref={this.mainScrollView}
          style={styles.mainScrollView}
          onScrollEndDrag={this.handleScrollEndDrag}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.home}>
            <Text>
                toast
            </Text>
          </View>
          <View
            style={styles.drawerHeader}
            ref={this.drawerHeader}
          >
            <Text style={styles.label}>BottomSheetBehavior !</Text>
          </View>
          <ScrollView
            style={styles.drawerScrollView}
            ref={this.drawerScrollView}
            onScrollEndDrag={this.handleNestedScrollEndDrag}
            nestedScrollEnabled
          >
            <View style={styles.appList}>
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  mainScrollView: {
    height: height - StatusBar.currentHeight
  },
  home: {
    height: height - 80
  },
  drawerHeader: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerScrollView: {
    height: height - 80 - StatusBar.currentHeight
  },
  appList: {
    height: 3 * height,
    backgroundColor: '#4389f2',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
})

export default SimpleView