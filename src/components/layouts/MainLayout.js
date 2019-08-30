import React from 'react'
import {
  View,
  StyleSheet,
  Text
} from 'react-native'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

const MainLayout = ({ langId }) => {

  return (
    <View
      style={styles.container}
    >
      <View
        style={styles.header}
      >
        <Text>
          {dayjs().locale('fr').format('dddd DD MMMM')}
        </Text>
      </View>
    </View>
  )
}

MainLayout.defaultProps = {
  langId: 'fr'
}

export default MainLayout
