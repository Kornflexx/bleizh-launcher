import React, { PureComponent } from 'react'
import {
  View,
  StyleSheet,
  Text
} from 'react-native'
import { connect } from 'react-redux'

import Application from '../Application/Application'
import {
  ITEM_HEIGHT,
  ITEM_WIDTH
} from '../../constants'
import { selectRecommandedApplications } from '../../store/selectors/usage'

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    flex: 1
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    padding: 9,
    flex: 0,
    right: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  sectionTitle: {
    flex: 0,
    marginBottom: 9,
    color: '#FFFFFF',
    fontSize: 16
  },
  list: {
    flex: 0,
    display: 'flex',
    flexDirection: 'row'
  }
})

class Body extends PureComponent {

  renderApplication = item => (
    <Application
      key={item.packageName}
      height={ITEM_HEIGHT}
      width={ITEM_WIDTH}
      {...item}
    />
  )

  render() {
    const {
      recommandedApplications
    } = this.props
    return (
      <View
        style={styles.container}
      >
        <View
          style={styles.section}
        >
          <Text
            style={styles.sectionTitle}
          >
            Recommandations
          </Text>
          <View
            style={styles.list}
          >
            {recommandedApplications.map(this.renderApplication)}
          </View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = state => ({
  recommandedApplications: selectRecommandedApplications(state)(new Date())
})

export default connect(mapStateToProps)(Body)
