import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/navigation/screens/login';           // index.tsx
import MapsScreen from './src/navigation/screens/maps/maps.screen'; // seu arquivo
import { RootStackParamList } from './src/navigation/screens/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Maps" component={MapsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
