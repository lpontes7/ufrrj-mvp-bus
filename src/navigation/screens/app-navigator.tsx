// src/navigation/AppNavigator.tsx
import React from 'react';

import LoginScreen from './login';
import { BusOverviewScreen } from './overiew';
import MapScreen from './maps/maps.screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BusDirection } from '@/src/types/bus';
import SignupScreen from './signup';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  BusOverview: { userId: string; busId: string };
  Maps: {
    userId: string;
    busId: string;
    initialSighting?: {
      lat: number;
      lng: number;
      createdAt: number;
      direction: BusDirection | null;
    } | null;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BusOverview"
          component={BusOverviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Maps"
          component={MapScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
