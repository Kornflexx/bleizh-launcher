import React, { Component, createRef } from 'react'
import {
  Text,
  View,
  StatusBar,
  Dimensions,
  StyleSheet,
  Animated,
  PanResponder
} from 'react-native'
import { NativeModules } from 'react-native'

import ScrollBar from './ScrollBar'
import ApplicationList from './ApplicationList'
import Header from './Header'

const { width, height } = Dimensions.get('window')



const DRAWER_HEADER_HEIGHT = 80
const DRAWER_HEADER_OPEN_HEIGHT = 50
const DRAWER_SCROLLVIEW_HEIGHT = height - DRAWER_HEADER_OPEN_HEIGHT - StatusBar.currentHeight
const DRAWER_SCROLLBAR_WIDTH = 10
const DRAWER_SCROLLBAR_HEIGHT = 60
const APP_PER_ROW = 5
const APP_ITEM_WIDTH = Math.round((width - 2 * DRAWER_SCROLLBAR_WIDTH) / APP_PER_ROW)
const APP_ITEM_HEIGHT = 4 / 3 * APP_ITEM_WIDTH
const PROGRESS_LETTER_SIZE = 90


const getRowProgress = (progress, rowCount) => {
  return Math.ceil(Math.max(progress, 0) * (rowCount - 1))
}

const getProgressLetter = (applicationLetterRow, progress, rowCount) => {
  let letter = null
  let rowProgress = getRowProgress(progress, rowCount)
  for (const row in applicationLetterRow) {
    if (row <= rowProgress) {
      letter = applicationLetterRow[row][0]
    }
  }
  return letter
}

const getApplicationLetterRow = applications =>
  applications
    .map(({ appName }) => appName)
    .reduce((acc, appName, i) => {
      const letter = appName[0].toUpperCase()
      const row = Math.floor(i / APP_PER_ROW)
      if (acc[row] && acc[row].includes(letter)) return acc;
      return {
        ...acc,
        [row]: acc[row]
          ? [...acc[row], letter]
          : [letter]
      }
    }, {})

class BottomSheet extends Component {

  mainScrollView = createRef()
  drawerScrollView = createRef()
  scrollFilter = createRef()
  scrollBar = createRef()
  header = createRef()
  animation = new Animated.Value(0)
  scrollbarAnimation = new Animated.Value(0)
  applicationLetterRow = {}
  rowProgress = 0
  lastScrollY = 0

  state = {
    progressLetter: null,
    isBarHandling: false,
    applications: [],
    resultApplications: null,
    isScrollBarVisible: false
  }

  _panResponder = PanResponder.create({
    // Ask to be the responder:
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    onPanResponderGrant: (evt, gestureState) => {
      const { y0 } = gestureState
      const scrollY = y0 - DRAWER_HEADER_HEIGHT - StatusBar.currentHeight
      const progress = scrollY / DRAWER_SCROLLVIEW_HEIGHT
      const scrollbarY = progress * (this.state.appListHeight - DRAWER_SCROLLVIEW_HEIGHT)

      this.scrollBar.current.animation.setValue(scrollbarY)
      this.drawerScrollView.current.getNode().scrollTo({ y: scrollbarY })
      this.lastScrollY = scrollbarY
      this.isBarHandling = true
      this.scrollBar.current.showProgressLetter()
    },
    onPanResponderMove: (evt, gestureState) => {
      const { moveY } = gestureState
      const scrollY = moveY - DRAWER_HEADER_HEIGHT - StatusBar.currentHeight
      const progress = scrollY / DRAWER_SCROLLVIEW_HEIGHT
      const scrollbarY = progress * (this.state.appListHeight - DRAWER_SCROLLVIEW_HEIGHT)

      const rowCount = Math.ceil(this.state.applications.length / APP_PER_ROW)
      const rowProgress = getRowProgress(progress, rowCount)

      this.scrollBar.current.animation.setValue(scrollbarY)
      this.animation.setValue(rowProgress * APP_ITEM_HEIGHT)

      if (this.rowProgress === rowProgress) return;

      this.rowProgress = rowProgress
      const progressLetter = getProgressLetter(this.applicationLetterRow, progress, rowCount)
      this.scrollBar.current.setProgressLetter(progressLetter)
      this.lastScrollY = rowProgress * APP_ITEM_HEIGHT
      this.drawerScrollView.current.getNode().scrollTo({ y: rowProgress * APP_ITEM_HEIGHT, animated: true })
    },
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
      if (!this.scrollBar.current) return;
      this.scrollBar.current.hideProgressLetter()
      Animated.timing(this.scrollBar.current.animation, {
        toValue: this.lastScrollY,
        duration: 500
      }).start(() => setTimeout(() => {
        this.isBarHandling = false
      }, 17))
    },
    onPanResponderTerminate: (evt, gestureState) => {
      if (!this.scrollBar.current) return;
      this.scrollBar.current.hideProgressLetter()
    },
    onShouldBlockNativeResponder: (evt, gestureState) => {
      return true;
    },
  });

  componentDidMount() {
    NativeModules.AppLauncher.getApplications()
      .then(applications => {
        const sortedApplications = applications
          .filter(({ packageName }, i, arr) =>
            !arr.slice(i + 1, arr.length).find(item => item.packageName === packageName)
          )
          .sort((a, b) => {
            if (a.appName.toUpperCase() < b.appName.toUpperCase()) return -1;
            if (a.appName.toUpperCase() > b.appName.toUpperCase()) return 1;
            return 0;
          })
        this.applicationLetterRow = getApplicationLetterRow(sortedApplications)
        this.setState({
          applications: sortedApplications
        })
      })
      .catch(err => console.log('eee', err))
  }

  closeDrawer = () => {
    this.mainScrollView.current.getNode().scrollTo({
      y: 0,
      animated: true
    })
    this.setScrollFilterEnabled(false)
    this.closeHeader()
  }

  openDrawer = () => {
    this.mainScrollView.current.getNode().scrollTo({
      y: height - DRAWER_HEADER_HEIGHT / 2,
      animated: true
    })
    this.setScrollFilterEnabled(true)
    this.openHeader()
  }

  openHeader = () => {
    if (!this.header.current) return;
    this.header.current.open()
  }

  closeHeader = () => {
    if (!this.header.current) return;
    this.header.current.close()
  }

  setScrollFilterEnabled = enabled => {
    if (!this.scrollFilter.current) return; 
    this.scrollFilter.current.setNativeProps({
      style: {
        height: enabled ? DRAWER_SCROLLVIEW_HEIGHT : 0
      }
    })
  }

  handleDrawerScrollEnd = (velocity, contentOffset) => {
    const forced = Math.abs(velocity.y) > 1
    const open = contentOffset.y > DRAWER_SCROLLVIEW_HEIGHT / 2
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
    this.drawerScrollView.current.getNode().getNativeScrollRef().measure((...args) => {
      const y = args[5]
      if (y <= DRAWER_HEADER_HEIGHT + StatusBar.currentHeight) return
      const contentOffset = {
        y: height - DRAWER_HEADER_HEIGHT - y
      }
      this.handleDrawerScrollEnd(nativeEvent.velocity, contentOffset)
    })
  }

  handleApplicationSearch = query => {
    if (!query) {
      return this.setState({ resultApplications: null })
    }
    if (!query.trim()) {
      return this.setState({ resultApplications: [] })
    }
    const { applications } = this.state
    const resultApplications = applications.filter(({ appName }) => {
      const words = query.toLowerCase().split(' ')
      const lowerAppName = appName.toLowerCase()
      return words.find(word => lowerAppName.includes(word)) || lowerAppName.includes(query)
    })
    this.setState({
      resultApplications
    })
  }

  render() {
    const { isBarHandling, applications, appListHeight, isScrollBarVisible, resultApplications } = this.state
    return (
      <View
        style={styles.container}
      >
        <StatusBar translucent backgroundColor='#205cb2' />
        <Animated.ScrollView
          ref={this.mainScrollView}
          style={styles.mainScrollView}
          onScrollEndDrag={this.handleScrollEndDrag}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.home}>
            <Text style={styles.label}>
              BottomSheetBehavior yolo
            </Text>
          </View>
          <Header
            height={DRAWER_HEADER_HEIGHT}
            openHeight={DRAWER_HEADER_OPEN_HEIGHT}
            onSearch={this.handleApplicationSearch}
            ref={this.header}
          />
          <View
            style={styles.drawerBody}
          >
            <Animated.ScrollView
              style={[
                styles.drawerScrollView,
                {
                  paddingRight: isScrollBarVisible ? 0 : DRAWER_SCROLLBAR_WIDTH
                }
              ]}
              ref={this.drawerScrollView}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: { contentOffset: { y: this.animation } },
                  },
                ],
                {
                  useNativeDriver: true,
                  listener: ({ nativeEvent: { contentOffset: { y } } }) => {
                    if (!this.isBarHandling && this.scrollBar.current) {
                      this.scrollBar.current.animation.setValue(y)
                    }
                  }
                }
              )}
              onScrollEndDrag={this.handleNestedScrollEndDrag}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              <ApplicationList
                onLayout={({ nativeEvent }) => {
                  this.setState({
                    appListHeight: nativeEvent.layout.height,
                    isScrollBarVisible: nativeEvent.layout.height > DRAWER_SCROLLVIEW_HEIGHT
                  })
                }}
                applications={resultApplications || applications}
                itemWidth={APP_ITEM_WIDTH}
                itemHeight={APP_ITEM_HEIGHT}
              />
            </Animated.ScrollView>
            {isScrollBarVisible && (
              <ScrollBar
                width={DRAWER_SCROLLBAR_WIDTH}
                height={DRAWER_SCROLLVIEW_HEIGHT}
                isBarHandling={isBarHandling}
                contentHeight={appListHeight}
                containerHeight={DRAWER_SCROLLVIEW_HEIGHT}
                indicatorWidth={DRAWER_SCROLLBAR_WIDTH}
                indicatorHeight={DRAWER_SCROLLBAR_HEIGHT}
                progressLetterSize={PROGRESS_LETTER_SIZE}
                ref={this.scrollBar}
              />
            )}
          </View>
        </Animated.ScrollView>
        {isScrollBarVisible && (
          <View
            ref={this.scrollFilter}
            style={styles.scrollFilter}
            {...this._panResponder.panHandlers}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  mainScrollView: {
    height: height,
  },
  home: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: StatusBar.currentHeight,
    height: height - DRAWER_HEADER_HEIGHT,
    backgroundColor: 'blue'
  },
  drawerScrollView: {
    height: DRAWER_SCROLLVIEW_HEIGHT,
    paddingLeft: DRAWER_SCROLLBAR_WIDTH
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    width,
    height: DRAWER_SCROLLVIEW_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, .5)'
  },
  scrollFilter: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: DRAWER_SCROLLBAR_WIDTH,
    height: 0,
    flex: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.01)'
  }
})

export default BottomSheet