import {
  PanResponder,
  Animated,
  StatusBar
} from 'react-native'

export const sortApplications = applications =>
  applications
    .filter(({ packageName }, i, arr) =>
      !arr.slice(i + 1, arr.length).find(item => item.packageName === packageName)
    )
    .sort((a, b) => {
      if (a.appName.toUpperCase() < b.appName.toUpperCase()) return -1;
      if (a.appName.toUpperCase() > b.appName.toUpperCase()) return 1;
      return 0;
    })

export const getApplicationLetterRow = (applications, { columnCount }) =>
  applications
    .map(({ appName }) => appName)
    .reduce((acc, appName, i) => {
      const letter = appName[0].toUpperCase()
      const row = Math.floor(i / columnCount)
      if (acc[row] && acc[row].includes(letter)) return acc;
      return {
        ...acc,
        [row]: acc[row]
          ? [...acc[row], letter]
          : [letter]
      }
    }, {})

export const measureListHeight = (applications, { itemHeight, columnCount }) =>
  Math.ceil(applications.length / columnCount) * itemHeight

export const getFilteredApplications = (applications, query) => {
  if (!query) {
    return null
  }
  if (!query.trim()) {
    return []
  }
  const words = query.toLowerCase().split(' ')
  return applications.filter(({ appName }) => {
    const lowerAppName = appName.toLowerCase()
    return words.find(word => lowerAppName.includes(word)) || lowerAppName.includes(query)
  })
}


export const createHandleItemsVisibly = ({
  getItemRefs,
  width
}) => (items, nextItems) => {
  const currentKeyed = {}
  const nextKeyed = {}
  const itemRefs = getItemRefs()

  for (let i = 0; i < nextItems.length; i++) {
    const item = nextItems[i]
    nextKeyed[item.packageName] = true
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    currentKeyed[item.packageName] = true
    if (!nextKeyed[item.packageName]) {
      const ref = itemRefs[item.packageName]
      if (!ref) continue
      ref.container.current.setNativeProps({
        style: {
          width: 0
        }
      })
    }
  }
  for (let i = 0; i < nextItems.length; i++) {
    const item = nextItems[i]
    if (!currentKeyed[item.packageName]) {
      const ref = itemRefs[item.packageName]
      if (!ref) continue
      ref.container.current.setNativeProps({
        style: {
          width
        }
      })
    }
  }
}

const getRowProgress = (progress, rowCount) => Math.ceil(Math.max(progress, 0) * rowCount)

const getProgressLetter = (letterRow, progress, rowCount) => {
  let letter = null
  let rowProgress = getRowProgress(progress, rowCount)
  for (const row in letterRow) {
    if (row <= rowProgress) {
      letter = letterRow[row][0]
    }
  }
  return letter
}

const cubic = pos => {
  return (-0.5 * (Math.cos(Math.PI*pos) -1));
}

const createAnimateScrollView = (ref, frames = 30) => {
  const state = {
    targetY: 0,
    currentY: 0,
    targetDy: 0,
    frameCount: 0,
    interval: null
  }
  const animation = () => {
    if (state.frameCount === 0) {
    } else if(state.frameCount === 1) {
      state.currentY = state.targetY
      state.frameCount = 0
      ref.current.getNode().scrollTo({ y: state.currentY, animated: false })
    } else {
      state.currentY += (state.targetDy / frames)
      state.frameCount -= 1
      ref.current.getNode().scrollTo({ y: state.currentY, animated: false })
      requestAnimationFrame(animation)
    }
  }

  return (currentY, targetY) => {
    const start = state.frameCount === 0
    state.currentY = currentY || state.currentY
    state.targetY = targetY
    state.targetDy = targetY - state.currentY
    state.frameCount = frames
    if (start) {
      requestAnimationFrame(animation)
    }
  }
}

export const createPanResponder = (
  {
    getFrozenState,
    setFrozenState
  },
  {
    scrollBar,
    flatList,
    itemHeight,
    columnCount,
    baseListHeight,
    baseListOffsetY,
    listAnimation
  }
) => {
  const state = {
    lastScrollY: 0,
    rowProgress: 0
  }
  const getRowCount = (currentApplications) => Math.ceil(currentApplications.length / columnCount)
  const getListHeight = (currentApplications) => getRowCount(currentApplications) * itemHeight
  const getScrollProgress = (y) => {
    const scrollY = y - baseListOffsetY - StatusBar.currentHeight
    return Math.max(0, scrollY / baseListHeight)
  }
  const animateScrollView = createAnimateScrollView(flatList, 20)


  return PanResponder.create({
    // Ask to be the responder:
    onStartShouldSetPanResponder: () => getFrozenState().isScrollBarVisible,
    onStartShouldSetPanResponderCapture: () => getFrozenState().isScrollBarVisible,
    onMoveShouldSetPanResponder: () => getFrozenState().isScrollBarVisible,
    onMoveShouldSetPanResponderCapture: () => getFrozenState().isScrollBarVisible,
    onPanResponderGrant: (_, gestureState) => {
      const { y0 } = gestureState
      const {
        currentApplications
      } = getFrozenState()
      const progress = getScrollProgress(y0)
      const scrollbarY = progress * (getListHeight(currentApplications) - baseListHeight)
      scrollBar.current.animation.setValue(scrollbarY)
      scrollBar.current.showProgressLetter()
      animateScrollView(listAnimation._value, scrollbarY + 5)
      //flatList.current.scrollTo({ y: scrollbarY + 5, animated: true })
      state.lastScrollY = scrollbarY + 5
      setFrozenState({ isBarHandling: true })
    },
    onPanResponderMove: (_, gestureState) => {
      const { moveY, vy } = gestureState
      const {
        currentApplications,
        letterRow
      } = getFrozenState()
      
      const progress = getScrollProgress(moveY)
      const scrollbarY = progress * (getListHeight(currentApplications) - baseListHeight)

      const rowCount = getRowCount(currentApplications)
      const rowProgress = getRowProgress(progress, rowCount)

      scrollBar.current.animation.setValue(scrollbarY)
      if (state.rowProgress === rowProgress) return;
      const scrollY = rowProgress * itemHeight
      animateScrollView(null, scrollY + 5)
      state.lastScrollY = scrollY + 5
      
      //flatList.current.scrollTo({ y: scrollY + 5, animated: true })
      
      state.rowProgress = rowProgress
      const progressLetter = getProgressLetter(letterRow, progress, rowCount)
     
      scrollBar.current.setProgressLetter(progressLetter)
    },
    onPanResponderTerminationRequest: () => true,
    onPanResponderRelease: () => {
      if (!scrollBar.current) return;
      scrollBar.current.hideProgressLetter()
      Animated.timing(scrollBar.current.animation, {
        toValue: state.lastScrollY,
        duration: 200
      }).start(() => setTimeout(() => {
        setFrozenState({ isBarHandling: false })
      }, 17))
    },
    onPanResponderTerminate: () => {
      if (!scrollBar.current) return;
      scrollBar.current.hideProgressLetter()
    },
    onShouldBlockNativeResponder: () => {
      return true;
    },
  });
}
  