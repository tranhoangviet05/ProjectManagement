import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import ToursScreen from "../screens/ToursScreen";
import DetailScreen from "../screens/DetailScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: "#0284c7" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Trang chủ" }} />
      <Stack.Screen name="Tours" component={ToursScreen} options={{ title: "Tour Du Lịch" }} />
      <Stack.Screen name="Detail" component={DetailScreen} options={{ title: "Chi Tiết Tour" }} />
    </Stack.Navigator>
  );
}
