import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';
import ManagePropertiesScreen from './screens/ManagePropertiesScreen';
import AddEditPropertyScreen from './screens/AddEditPropertyScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Properties' }}
        />
        <Stack.Screen 
          name="PropertyDetails" 
          component={PropertyDetailsScreen}
          options={{ title: 'Details' }}
        />
        <Stack.Screen 
          name="ManageProperties" 
          component={ManagePropertiesScreen}
          options={{ title: 'Manage' }}
        />
        <Stack.Screen 
          name="AddEditProperty" 
          component={AddEditPropertyScreen}
          options={{ title: 'Add/Edit', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
