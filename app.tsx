import { useFonts } from 'expo-font';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import ManageScreen from './app/(tabs)/manage';
import { DataProvider } from './contexts/DataContext';

export default function App() {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <DataProvider>
      <ManageScreen />
    </DataProvider>
  );
}

// use the space font for the label of the date input of manage 
