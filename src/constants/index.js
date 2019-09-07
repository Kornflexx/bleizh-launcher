import { Dimensions, StatusBar } from 'react-native'
import ExtraDimensions from 'react-native-extra-dimensions-android'

const { width: rawWidth, height: rawHeight } = Dimensions.get('screen')
export const height = rawHeight
export const width = rawWidth

export const HEADER_HEIGHT = 60
export const BODY_HEIGHT = rawHeight - StatusBar.currentHeight - ExtraDimensions.getSoftMenuBarHeight() - HEADER_HEIGHT
export const ITEM_WIDTH = (rawWidth - 9 * 2) / 5
export const ITEM_HEIGHT = 100
export const SCROLLBAR_WIDTH = 10
export const SCROLLBAR_HEIGHT = BODY_HEIGHT
export const SCROLLBAR_INDICATOR_WIDTH = 10
export const SCROLLBAR_INDICATOR_HEIGHT = 60
export const PROGRESS_LETTER_SIZE = 90