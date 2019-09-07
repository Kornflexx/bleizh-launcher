import React, { PureComponent, createRef } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  View,
  StatusBar,
  Animated,
  BackHandler
} from 'react-native'
import ExtraDimensions from 'react-native-extra-dimensions-android';

import {
  sortApplications,
  getApplicationLetterRow,
  measureListHeight,
  getFilteredApplications,
  createHandleItemsVisibly,
  createPanResponder
} from './utils'

import {
  height,
  width,
  HEADER_HEIGHT,
  BODY_HEIGHT,
  ITEM_WIDTH,
  ITEM_HEIGHT,
  SCROLLBAR_WIDTH,
  SCROLLBAR_HEIGHT,
  SCROLLBAR_INDICATOR_WIDTH,
  SCROLLBAR_INDICATOR_HEIGHT,
  PROGRESS_LETTER_SIZE
} from '../../constants'
import applicationActions from '../../store/actionTypes/application'

import Application from '../Application/Application'
import Header from './Header'
import ScrollBar from './ScrollBar'
import Body from '../Body/Body'

const styles = StyleSheet.create({
  body: {
    marginTop: StatusBar.currentHeight,
    height: BODY_HEIGHT,
    paddingBottom: StatusBar.currentHeight,
    width,
  },
  header: {
    right: 0,
    left: 0,
    height: HEADER_HEIGHT
  },
  ghostHeader: {
    height: HEADER_HEIGHT,
    width,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  flatListContent: {
    display: 'flex',
  },
  list: {
    display: 'flex',
    width,
    height: BODY_HEIGHT + ExtraDimensions.getSoftMenuBarHeight(),
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  listContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    padding: 9,
    paddingBottom: 9 + ExtraDimensions.getSoftMenuBarHeight(),
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  scrollFilter: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    width: SCROLLBAR_WIDTH,
    height: SCROLLBAR_HEIGHT,
    right: 0,
    bottom: 0,
    flex: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.01)'
  }
});

class BottomSheet extends PureComponent {

  flatList = createRef()
  mainScrollView = createRef()
  scrollBar = createRef()
  scrollFilter = createRef()
  header = createRef()
  mainAnimation = new Animated.Value(0)
  listAnimation = new Animated.Value(0)

  frozenState = {
    letterRow: {},
    applications: [],
    currentApplications: [],
    count: 0,
    listHeight: 0,
    isBarHandling: false,
    isScrollBarVisible: false,
    isOpen: false,
    isHeaderOpen: false,
    itemRefs: []
  }
  panResponder = createPanResponder(
    {
      getFrozenState: () => this.frozenState,
      setFrozenState: (partialState) => {
        this.frozenState = {
          ...this.frozenState,
          ...partialState
        }
      }
    },
    {
      scrollBar: this.scrollBar,
      flatList: this.flatList,
      itemHeight: this.props.itemHeight,
      columnCount: this.props.columnCount,
      baseListHeight: BODY_HEIGHT,
      baseListOffsetY: HEADER_HEIGHT,
      listAnimation: this.listAnimation
    }
  )

  state = {
    data: []
  }

  componentDidCatch(...args) {
    console.log('catch', ...args)
  }

  componentDidMount() {
    this.props.requestApplications()
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
  }

  componentWillUnmount() {
    this.backHandler.remove()
  }

  handleBackPress = () => {
    this.setDrawerOpen(false, true)
    return true
  }

  setDrawerOpen = (open, scroll) => {
    if (scroll) this.mainScrollView.current.getNode().scrollTo({ y: open ? BODY_HEIGHT : 0, animated: true })
    this.frozenState.isHeaderOpen = open
  }

  componentDidUpdate = (lastProps) => {
    if (this.props.data !== lastProps.data) {
      const sortedApplications = this.props.data
      this.frozenState.letterRow = getApplicationLetterRow(sortedApplications, this.props)
      this.frozenState.height = measureListHeight(sortedApplications, this.props)
      this.frozenState.applications = sortedApplications
      this.frozenState.currentApplications = sortedApplications
      this.frozenState.isScrollBarVisible = this.frozenState.height > SCROLLBAR_HEIGHT
      if (this.scrollBar.current) {
        this.scrollBar.current.setProperties({
          contentHeight: this.frozenState.height,
          isVisible: this.frozenState.isScrollBarVisible
        })
      }
    }
  }

  handleScrollEndDrag = ({ nativeEvent }, scroll = false) => {
    const { velocity, contentOffset } = nativeEvent
    const forced = Math.abs(velocity.y) > 1
    const open = contentOffset.y > height / 2
    if (forced) {
      this.setDrawerOpen(velocity.y < 0, scroll)
    } else {
      this.setDrawerOpen(open, scroll)
    }
  }

  handleScroll = ({ nativeEvent }) => {
    const { contentOffset } = nativeEvent
    if (this.scrollBar.current && !this.frozenState.isBarHandling) {
      this.scrollBar.current.animation.setValue(contentOffset.y)
    }
  }

  handleNestedScrollEndDrag = ({ nativeEvent }) => {
    this.flatList.current.getNode().getNativeScrollRef().measure((...args) => {
      const y = args[5]
      if (y <= StatusBar.currentHeight + HEADER_HEIGHT) return
      const contentOffset = {
        y: height - y
      }
      this.handleScrollEndDrag({
        nativeEvent: {
          velocity: nativeEvent.velocity,
          contentOffset
        }
      }, true)
    })
  }

  handleItemsVisibility = createHandleItemsVisibly({
    width: (width - 9 * 2) / 5,
    getItemRefs: () => this.frozenState.itemRefs
  })

  handleSearch = (query) => {
    const filteredApplications = getFilteredApplications(this.frozenState.applications, query)
    const nextApplications = filteredApplications || this.frozenState.applications
    this.handleItemsVisibility(this.frozenState.currentApplications, nextApplications)
    this.frozenState.letterRow = getApplicationLetterRow(nextApplications, this.props)
    this.frozenState.height = measureListHeight(nextApplications, this.props)
    this.frozenState.currentApplications = nextApplications
    this.frozenState.isScrollBarVisible = this.frozenState.height > SCROLLBAR_HEIGHT
    if (this.scrollBar.current) {
      this.scrollBar.current.setProperties({
        contentHeight: this.frozenState.height,
        isVisible: this.frozenState.isScrollBarVisible
      })
    }
  }

  handleHeaderFocus = () => {
    this.setDrawerOpen(true, true)
  }

  keyExtractor = item => item.packageName

  renderApplication = (item, i) => (
    <Application
      ref={(ref) => this.frozenState.itemRefs[item.packageName] = ref}
      key={item.packageName}
      height={this.props.itemHeight}
      width={ITEM_WIDTH}
      {...item}
    />
  )

  render() {
    const { data } = this.props
    return (
      <>
        <Animated.ScrollView
          ref={this.mainScrollView}
          contentContainerStyle={styles.flatListContent}
          snapToOffsets={[BODY_HEIGHT]}
          onScroll={Animated.event([{
            nativeEvent: {
              contentOffset: { y: this.mainAnimation }
            }
          }],
            {
              useNativeDriver: true
            })}
          nestedScrollEnabled
          pagingEnabled
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          <View
            style={styles.body}
          >
            <Body />
          </View>
          <Header
            ref={this.header}
            height={HEADER_HEIGHT}
            onSearch={this.handleSearch}
            onFocus={this.handleHeaderFocus}
            style={{
              opacity: this.mainAnimation.interpolate({
                inputRange: [0, HEADER_HEIGHT],
                outputRange: [0, 1],
                extrapolate: 'clamp'
              })
            }}
            backgroundOpenStyle={{
              opacity: this.mainAnimation.interpolate({
                inputRange: [0, HEADER_HEIGHT],
                outputRange: [0, 1],
                extrapolate: 'clamp'
              }),
              backgroundColor: '#212121'
            }}
            backgroundCloseStyle={{
              opacity: this.mainAnimation.interpolate({
                inputRange: [0, HEADER_HEIGHT],
                outputRange: [1, 0],
                extrapolate: 'clamp'
              }),
              borderRadius: (HEADER_HEIGHT - 15) / 2,
              backgroundColor: '#FFFFFF'
            }}
          />
          <Animated.View
            style={{
              flex: 1,
              opacity: this.mainAnimation.interpolate({
                inputRange: [0, HEADER_HEIGHT],
                outputRange: [0, 1],
                extrapolate: 'clamp'
              })
            }}
          >
            <Animated.ScrollView
              ref={this.flatList}
              style={styles.list}
              onScroll={Animated.event([{
                nativeEvent: {
                  contentOffset: {
                    y: this.listAnimation
                  }
                }
              }],
                {
                  listener: this.handleScroll,
                  useNativeDriver: true
                }
              )}
              onScrollEndDrag={this.handleNestedScrollEndDrag}
              scrollEnabled
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical={true}
              overScrollMode="never"
            >
              <View style={styles.listContentContainer}>
                {data.map(this.renderApplication)}
              </View>
            </Animated.ScrollView>
            <ScrollBar
              ref={this.scrollBar}
              offsetY={HEADER_HEIGHT}
              width={SCROLLBAR_WIDTH}
              height={SCROLLBAR_HEIGHT}
              indicatorWidth={SCROLLBAR_INDICATOR_WIDTH}
              indicatorHeight={SCROLLBAR_INDICATOR_HEIGHT}
              progressLetterSize={PROGRESS_LETTER_SIZE}
            />
          </Animated.View>
        </Animated.ScrollView>
        <View
          ref={this.scrollFilter}
          style={styles.scrollFilter}
          {...this.panResponder.panHandlers}
        />
      </>
    )
  }
}

BottomSheet.propTypes = {
  itemHeight: PropTypes.number,
  columnCount: PropTypes.number
}

BottomSheet.defaultProps = {
  itemHeight: ITEM_HEIGHT,
  columnCount: 5
}

const mapStateToProps = state => ({
  data: sortApplications(state.application.items)
})

const mapDispatchToProps = dispatch => ({
  requestApplications: () => dispatch(applicationActions.requestApplications())
})

export default connect(mapStateToProps, mapDispatchToProps)(BottomSheet)
