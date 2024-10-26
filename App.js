import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import Chats from './src/screens/Chats';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homepage from './src/screens/Homepage';
import Verification from './src/screens/Verification';
import Card from './src/screens/TinderCards';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import Display from './src/screens/card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyTabBar from './src/screens/Navbar';
import Profile from './src/screens/Profile';
import Matches from './src/screens/MatchesScreen';
import Welcome from './src/screens/Welcome';
import ChatRoom from './src/screens/ChatRoom'; 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log("Error Getting Token");
      }
    };
    getToken();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          {isLoggedIn ? (
            <>
              <Stack.Screen name="HomeTabs" options={{ headerShown: false }}>
                {() => (
                  <Tab.Navigator tabBar={(props) => <MyTabBar {...props} />}>
                    <Tab.Screen name="Home" component={Card} />
                    <Tab.Screen name="Matches" component={Matches} />
                    <Tab.Screen name="Chats" component={Chats} />
                    <Tab.Screen name="Profile" component={Profile} />
                  </Tab.Navigator>
                )}
              </Stack.Screen>
              {/* Add the ChatRoom screen to the Stack Navigator */}
              <Stack.Screen name="ChatRoom" component={ChatRoom} options={{ headerShown: true }} />
            </>
          ) : (
            <>
              <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
              <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
              <Stack.Screen name="Home" component={Card} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  tabButtonText: {
    textTransform: "uppercase"
  },
  iconMenu: {
    fontFamily: "tinderclone",
    height: 20,
    paddingBottom: 7
  }
});
