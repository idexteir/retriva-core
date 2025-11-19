import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';
import ManagePropertiesScreen from './screens/ManagePropertiesScreen';
import AddEditPropertyScreen from './screens/AddEditPropertyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ title: 'Properties' }}
      />
      <Stack.Screen 
        name="PropertyDetails" 
        component={PropertyDetailsScreen}
        options={{ title: 'Details' }}
      />
    </Stack.Navigator>
  );
}

// Manage Stack Navigator
function ManageStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ManageMain" 
        component={ManagePropertiesScreen}
        options={{ title: 'Manage Properties' }}
      />
      <Stack.Screen 
        name="AddEditProperty" 
        component={AddEditPropertyScreen}
        options={{ title: 'Property', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

// Bottom Tab Navigator
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Browse',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 28 : 24, marginBottom: 4 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Manage" 
        component={ManageStack}
        options={{
          tabBarLabel: 'Manage',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 28 : 24, marginBottom: 4 }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <BottomTabs />
    </NavigationContainer>
  );
}
