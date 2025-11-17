// src/navigation/AppNavigator.tsx
import React from "react";

import LoginScreen from "./login";
import { BusOverviewScreen } from "./overiew";
import MapScreen from "./maps/maps.screen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


export type RootStackParamList = {
  Login: undefined;
  BusOverview: { userId: string; busId: string };
  Maps: { userId: string; busId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Login" }}
        />
        <Stack.Screen
          name="BusOverview"
          component={BusOverviewScreen}
          options={{ title: "Ônibus" }}
        />
        <Stack.Screen
          name="Maps"
          component={MapScreen}
          options={{ title: "Maps" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
