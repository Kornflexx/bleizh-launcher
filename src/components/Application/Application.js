import React, { Component, createRef } from 'react'
import { connect } from 'react-redux'
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  NativeModules
} from 'react-native'
import FastImage from 'react-native-fast-image'

import usageActions from '../../store/actionTypes/usage'

class Application extends Component {

  image = createRef()
  container = createRef()

  handlePress = () => {
    NativeModules.AppLauncher.startApplication(this.props.packageName)
    try {

      this.props.addUsage()
    } catch(e) {
      console.log('e1', e)
    }
  }

  render() {
    const { appName, packageName, icon, height, width } = this.props
    const iconHeight = height / 1.8
    return (
      <TouchableOpacity
        ref={this.container}
        key={packageName}
        style={[
          styles.container,
          {
            width,
            height
          }
        ]}
        onPress={this.handlePress}
      >
        <View style={styles.wrapper}>
          <FastImage
            ref={this.image}
            style={[
              styles.icon,
              {
                height: iconHeight,
                width: iconHeight,
                borderRadius: iconHeight / 2
              }
            ]}
            resizeMode={FastImage.resizeMode.contain}
            source={{ uri: `data:image/png;base64,${icon}` }}
          />
          <Text
            style={styles.name}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {appName}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  wrapper: {
    padding: 5,
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    flex: 1,
    width: '100%'
  },
  icon: {
    margin: 10
  },
  name: {
    color: '#FFF',
    fontSize: 12
  },
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  addUsage: () => dispatch(usageActions.addUsage(ownProps.packageName))
})

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(Application)
