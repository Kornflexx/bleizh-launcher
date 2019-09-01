/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ImageBackground
} from 'react-native';
import {
  Colors
} from 'react-native/Libraries/NewAppScreen';
import Toast from './BottomSheet/BottomSheet'
import Wallpaper from '../assets/wallpaper.jpg'

const App = () => {

  return (
    <ImageBackground
      source={Wallpaper}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%'
      }}
    >
      <Toast />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
  }
});

export default App;
