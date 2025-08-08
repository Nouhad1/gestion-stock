import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import Notifications from './components/Notifications';
import Commandes from './components/Commandes';
import Produits from './components/Produits';
import ProductDetailScreen from './components/ProductDetailScreen';
import EditableAchatTable from './components/EditableAchatList';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// 🎯 Navigation latérale (après connexion)
function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Notifications" component={Notifications} />
      <Drawer.Screen name="Produits" component={Produits} />
      <Drawer.Screen name="Commandes" component={Commandes} />
      <Drawer.Screen name="Achats (Entrées)" component={EditableAchatTable} />
    </Drawer.Navigator>
  );
}

// 🏁 Point d'entrée de l'app
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={DrawerNavigator} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
