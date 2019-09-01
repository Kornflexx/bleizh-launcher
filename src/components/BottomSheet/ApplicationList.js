import React, { PureComponent } from 'react'
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  NativeModules
} from 'react-native'
import FastImage from 'react-native-fast-image'

class ApplicationList extends PureComponent {

  render() {
    const { onLayout, itemWidth, itemHeight, applications } = this.props

    return (
      <View
        style={styles.container}
        onLayout={onLayout}
      >
        {applications.map(application => {
          const { appName, packageName, icon } = application
          return (
            <TouchableOpacity
              key={packageName}
              style={[
                styles.item,
                {
                  width: itemWidth,
                  height: itemHeight
                }
              ]}
              onPress={() => {
                NativeModules.AppLauncher.startApplication(packageName)
              }}
            >
              <FastImage
                style={[
                  styles.itemIcon,
                  {
                    width: itemWidth
                  }
                ]}
                resizeMode={FastImage.resizeMode.contain}
                source={{ uri: `data:image/png;base64,${icon}` }}
              />
              <Text
                style={styles.itemName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {appName}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemIcon: {
    flex: 1,
    margin: 8,
  },
  itemName: {
    color: '#FFF',
    fontSize: 12
  },
})

export default ApplicationList
