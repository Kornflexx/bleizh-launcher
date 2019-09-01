import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import {
  Text,
  TextInput,
  View,
  StatusBar,
  Dimensions,
  StyleSheet,
  Animated,
  Shape,
  ScrollView,
  PanResponder,
  TouchableOpacity,
  Image
} from 'react-native'
import { NativeModules } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Svg, Defs, Use, G, Circle, Rect } from 'react-native-svg'

const { width, height } = Dimensions.get('window')



const DRAWER_HEADER_HEIGHT = 80
const DRAWER_SCROLLVIEW_HEIGHT = height - DRAWER_HEADER_HEIGHT - StatusBar.currentHeight
const DRAWER_SCROLLBAR_WIDTH = 10
const DRAWER_SCROLLBAR_HEIGHT = 60
const APP_PER_ROW = 5
const APP_ITEM_WIDTH = Math.round((width - 2 * DRAWER_SCROLLBAR_WIDTH) / APP_PER_ROW)
const APP_ITEM_HEIGHT = 4 / 3 * APP_ITEM_WIDTH
const PROGRESS_LETTER_SIZE = 90

const getApplicationLetterRow = applications => {
  return applications
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
}

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

class SimpleView extends Component {

  mainScrollView = createRef()
  drawerScrollView = createRef()
  drawerHeader = createRef()
  container = createRef()
  progressLetterText = createRef()
  progressLetter = createRef()
  scrollFilter = createRef()
  animation = new Animated.Value(0)
  scrollbarAnimation = new Animated.Value(0)
  applicationLetterRow = {}
  rowProgress = 0
  lastScrollUpdateDate = 0

  state = {
    progressLetter: null,
    isBarHandling: false,
    applications: []
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

      this.scrollbarAnimation.setValue(scrollbarY)
      this.drawerScrollView.current.getNode().scrollTo({ y: scrollbarY })
      this.lastScrollUpdateDate = new Date()
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!this.state.isBarHandling) {
        this.setState({ isBarHandling: true })
      }
      const { moveY, vy } = gestureState
      const scrollY = moveY - DRAWER_HEADER_HEIGHT - StatusBar.currentHeight
      const progress = scrollY / DRAWER_SCROLLVIEW_HEIGHT
      const scrollbarY = progress * (this.state.appListHeight - DRAWER_SCROLLVIEW_HEIGHT)

      const rowCount = Math.ceil(this.state.applications.length / APP_PER_ROW)
      const rowProgress = getRowProgress(progress, rowCount)

      this.scrollbarAnimation.setValue(scrollbarY)
      this.animation.setValue(rowProgress * APP_ITEM_HEIGHT)
      
      if (this.rowProgress === rowProgress) return;

      this.rowProgress = rowProgress
      const progressLetter = getProgressLetter(this.applicationLetterRow, progress, rowCount)
      if (this.progressLetterText.current) {
        this.progressLetterText.current.setNativeProps({ text: progressLetter })
      }

      this.drawerScrollView.current.getNode().scrollTo({ y: rowProgress * APP_ITEM_HEIGHT, animated: true })
    },
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
      Animated.timing(this.scrollbarAnimation, {
        toValue: this.animation._value,
        duration: 100
      }).start(() => setTimeout(() => this.setState({ isBarHandling: false }), 17))
    },
    onPanResponderTerminate: (evt, gestureState) => {
      this.setState({ isBarHandling: false })
    },
    onShouldBlockNativeResponder: (evt, gestureState) => {
      return true;
    },
  });

  componentDidMount() {
    NativeModules.AppLauncher.getApplications()
      .then(applications => {
        console.log(applications)
        const sortedApplications = applications.sort((a, b) => {
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
  }

  openDrawer = () => {
    this.mainScrollView.current.getNode().scrollTo({
      y: height - DRAWER_HEADER_HEIGHT,
      animated: true
    })
    this.setScrollFilterEnabled(true)
  }

  setScrollFilterEnabled = enabled => {
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

  getScrollbarTranslateY = (deltaY = 0) => {
    const { isBarHandling, appListHeight } = this.state
    if (!appListHeight) {
      return 0
    }
    const animation = isBarHandling ? this.scrollbarAnimation : this.animation
    return animation.interpolate({
      inputRange: [0, Math.max(this.state.appListHeight - DRAWER_SCROLLVIEW_HEIGHT, 0)],
      outputRange: [deltaY, DRAWER_SCROLLVIEW_HEIGHT - DRAWER_SCROLLBAR_HEIGHT + deltaY],
      extrapolate: 'clamp'
    })
  }

  render() {
    const { isBarHandling, applications } = this.state
    return (
      <View
        ref={this.container}
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
            <Text>
              toast
            </Text>
          </View>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']}
            style={styles.drawerHeader}
            ref={this.drawerHeader}
          >
            <Text style={styles.label}>BottomSheetBehavior !</Text>
          </LinearGradient>
          <Animated.View
            style={styles.drawerBody}
          >
            <Animated.ScrollView
              style={[
                styles.drawerScrollView
              ]}
              ref={this.drawerScrollView}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: { contentOffset: { y: this.animation } },
                  },
                ],
                {
                  useNativeDriver: true
                }
              )}
              onScrollEndDrag={this.handleNestedScrollEndDrag}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              <View
                style={styles.appList}
                onLayout={({ nativeEvent }) => {
                  this.setState({
                    appListHeight: nativeEvent.layout.height
                  })
                }}
              >
                {applications.map(({ appName, packageName, icon }) => (
                  <TouchableOpacity
                    key={packageName}
                    style={styles.appItem}
                    onPress={() => {
                      NativeModules.AppLauncher.startApplication(packageName)
                    }}
                  >
                    <Image
                      style={styles.appIcon}
                      resizeMode="contain"
                      source={{ uri: `data:image/png;base64,${icon}` }}
                    />
                    <Text
                      style={styles.appName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {appName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.ScrollView>
            <View
              style={styles.drawerScrollbar}
            >
              <View style={styles.drawerScrollbarBackground} />
              <Animated.View
                style={[
                  styles.drawerScrollbarIndicator,
                  {
                    transform: [{
                      translateY: this.getScrollbarTranslateY()
                    }]
                  }
                ]}
              />
              {isBarHandling && (
                <Animated.View
                  ref={this.progressLetter}
                  style={[
                    styles.progressLetter,
                    {
                      transform: [
                        {
                          translateX: -(4 / 5) * PROGRESS_LETTER_SIZE
                        }, {
                          translateY: this.getScrollbarTranslateY(-(2 / 3) * PROGRESS_LETTER_SIZE)
                        }
                      ]
                    }
                  ]}
                >
                  <Svg style={styles.progressLetterTail} height={PROGRESS_LETTER_SIZE} width={PROGRESS_LETTER_SIZE} viewBox="0 0 300 100">
                    <Defs>
                      <G id="shape">
                        <G>
                          <Circle cx="50" cy="50" r="100" fill="pink" />
                          <Rect x="50" y="50" width="100" height="100" fill="pink" />
                        </G>
                      </G>
                    </Defs>
                    <Use href="#shape" x="50" y="0" />
                  </Svg>
                  <View style={styles.progressLetterBody}>
                    <TextInput style={styles.progressLetterText} editable={false} ref={this.progressLetterText} />
                  </View>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        </Animated.ScrollView>
        <View
          ref={this.scrollFilter}
          style={styles.scrollFilter}
          {...this._panResponder.panHandlers}
        >
        </View>
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
    height: height - DRAWER_HEADER_HEIGHT
  },
  drawerHeader: {
    height: DRAWER_HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  drawerScrollbar: {
    width: DRAWER_SCROLLBAR_WIDTH,
    height: DRAWER_SCROLLVIEW_HEIGHT,
  },
  drawerScrollbarBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: (2 / 3) * DRAWER_SCROLLBAR_WIDTH,
    height: DRAWER_SCROLLVIEW_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  drawerScrollbarIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: DRAWER_SCROLLBAR_HEIGHT,
    width: (4 / 5) * DRAWER_SCROLLBAR_WIDTH,
    backgroundColor: 'pink',
    borderRadius: 4
  },
  scrollFilter: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: DRAWER_SCROLLBAR_WIDTH,
    height: 0,
    flex: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.01)'
  },
  appList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1
  },
  appItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: APP_ITEM_WIDTH,
    height: APP_ITEM_HEIGHT,
    padding: 4,
    paddingBottom: 5
  },
  appIcon: {
    flex: 1,
    width: APP_ITEM_WIDTH,
    margin: 6,
  },
  appName: {
    color: '#FFF',
    fontSize: 12
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressLetter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: (2 / 3) * PROGRESS_LETTER_SIZE,
    height: PROGRESS_LETTER_SIZE
  },
  progressLetterBody: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  progressLetterText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center'
  },
  progressLetterTail: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: PROGRESS_LETTER_SIZE,
    height: PROGRESS_LETTER_SIZE
  }
})

export default SimpleView