import React from 'react';
import {
  StyleSheet,
  ImageBackground
} from 'react-native';
import { Provider as StoreProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import createStore from '../store'

import Toast from './BottomSheet/BottomSheet'
import Wallpaper from '../assets/wallpaper.jpg'

const { store, persistor } = createStore()

const App = () => {

  return (
    <ImageBackground
      source={Wallpaper}
      style={styles.background}
    >
      <StoreProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Toast />
        </PersistGate>
      </StoreProvider>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  }
});

export default App;
