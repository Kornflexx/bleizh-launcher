import React, { PureComponent, createRef } from 'react'
import {
  StyleSheet,
  Text,
  Animated,
  View,
  TextInput,
  Keyboard,
  ScrollView
} from 'react-native'

import Icon from 'react-native-vector-icons/Fontisto';
import LinearGradient from 'react-native-linear-gradient';

class Header extends PureComponent {

  scrollView = createRef()
  placeholder = createRef()
  textInput = createRef()
  timeout = null
  state = {
    searchValue: ''
  }

  setVisibility = (visible = false) => {
    if (visible) this.open()
    else this.close()
  }

  /*
  open = () => {
    const { height } = this.props
    if (this.scrollView.current) {
      this.scrollView.current.scrollTo({ y: height, animated: true })
    }
  }

  close = () => {
    if (this.scrollView.current) {
      this.scrollView.current.scrollTo({ y: 0, animated: true })
    }
    this.setState({ searchValue: null },
      () => setTimeout(() => this.props.onSearch(null), 250)
    )
  }
  */

  handleSearchChange = value => {
    this.setState({ searchValue: value })
    this.props.onSearch(value)
  }

  handleBlur = () => {
    if (this.placeholder.current && !this.state.searchValue) {
      this.placeholder.current.setNativeProps({
        style: {
          height: this.props.height - 15
        }
      })
    }
    if (this.keyboardHandler) {
      this.keyboardHandler.remove()
    }
  }

  handleFocus = () => {
    this.props.onFocus()
    if (this.placeholder.current) {
      this.placeholder.current.setNativeProps({
        style: {
          height: 0
        }
      })
    }
    this.keyboardHandler = Keyboard.addListener('keyboardDidHide', () => {
      if (this.textInput.current) {
        this.textInput.current.blur()
      }
    })
  }

  render() {
    const { searchValue } = this.state
    const { height, style, searchInputStyle, backgroundOpenStyle, backgroundCloseStyle } = this.props
    return (
      <View
        style={[
          styles.container,
          {
            height
          }
        ]}
      >
        <Animated.View
          style={[
            styles.gradiant,
            style
          ]}
        >
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']}
            style={[
              styles.gradiant
            ]}
          />
        </Animated.View>
        <View
          style={styles.searchWrapper}
        >
          <Animated.View
            style={[styles.background, backgroundOpenStyle]}
          />
          <Animated.View
            style={[styles.background, backgroundCloseStyle]}
          />
          <TextInput
            ref={this.textInput}
            style={[
              styles.searchInput,
              searchInputStyle
            ]}
            value={searchValue}
            onChangeText={this.handleSearchChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            blurOnSubmit
          />
          <View
            ref={this.placeholder}
            style={[
              styles.placeholder,
              {
                height: height - 15
              }
            ]}
            pointerEvents="none"
          >
            <View
              style={styles.placeholderImageWrapper}
            >
              <Icon
                name="search"
                color="#009688"
                iconStyle={styles.placeholderImage}
              />
            </View>
            <Text style={styles.placeholderText}>Rechercher dans les applications</Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({

  container: {
    display: 'flex',
    overflow: 'hidden'
  },
  wrapper: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    right: 0,
    left: 0
  },
  searchWrapper: {
    flex: 1,
    marginTop: 15,
    marginRight: 10,
    marginLeft: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 4,
    overflow: 'hidden'
  },
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    flex: 1
  },
  gradiant: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  searchInput: {
    flex: 1,
    padding: 0,
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center'
  },
  placeholder: {
    position: 'absolute',
    flex: 1,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  placeholderImageWrapper: {
    marginRight: 10
  },
  placeholderImage: {
    height: 32,
    width: 32,
  },
  placeholderText: {
    fontSize: 16,
    color: '#009688',
    flex: 0
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  }
})

export default Header
