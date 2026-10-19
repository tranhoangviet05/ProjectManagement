import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import AuthScreen from "../features/auth/screens/AuthScreen";
import TouristWorkspaceScreen from "../screens/TouristWorkspaceScreen";
import ProviderWorkspaceScreen from "../screens/ProviderWorkspaceScreen";
import ToursScreen from "../screens/ToursScreen";
import DetailScreen from "../screens/DetailScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : role === "provider" ? (
        <Stack.Screen name="ProviderWorkspace" component={ProviderWorkspaceScreen} />
      ) : (
        <>
          <Stack.Screen name="TouristWorkspace" component={TouristWorkspaceScreen} />
          <Stack.Screen
            name="Tours"
            component={ToursScreen}
            options={{ headerShown: true, title: "Danh sách Tour" }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{ headerShown: true, title: "Chi tiết Dịch vụ" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
