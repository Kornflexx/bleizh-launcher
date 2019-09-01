import React, { PureComponent, createRef } from 'react'
import {
  StyleSheet,
  Text,
  Animated,
  View,
  TextInput,
  Button,
  ScrollView
} from 'react-native'

import LinearGradient from 'react-native-linear-gradient';

class Header extends PureComponent {

  animation = new Animated.Value(0)
  scrollView = createRef()
  timeout = null
  state = {
    searchValue: 'dzdzddzd'
  }

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
    this.setState({ searchValue: null })
  }

  throttleOnSearch = value => {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    if (!value) return this.props.onSearch(value);
    this.props.onSearch(value)
  }

  handleSearchChange = value => {
    this.setState({ searchValue: value })
    this.throttleOnSearch(value)
  }

  render() {
    const { searchValue } = this.state
    const { height, openHeight } = this.props
    return (
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']}
        style={[
          styles.container,
          {
            height
          }
        ]}
      >
        <ScrollView
          ref={this.scrollView}
          style={[
            styles.toggle,
            {
              height
            }
          ]}
        >
          <View
            style={[
              styles.wrapper,
              {
                height
              }
            ]}
          >
            <Text>Yolo</Text>
          </View>
          <View
            style={[
              styles.wrapper,
              {
                height
              }
            ]}
          >
            <View
              style={[
                styles.searchWrapper,
                {
                  height: openHeight - 14,
                  borderRadius: (openHeight - 14) / 2
                }
              ]}
            >
              <TextInput
                style={styles.searchInput}
                value={searchValue}
                onChangeText={this.handleSearchChange}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden'
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%'
  },
  searchWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    margin: 7,
    paddingVertical: 2,
    paddingHorizontal: 10
  },
  searchInput: {
    flex: 1,
    padding: 0,
    color: '#FFF'
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  }
})

export default Header
