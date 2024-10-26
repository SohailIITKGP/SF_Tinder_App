import { View, Text, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { useState, useEffect } from "react";
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; 

export default function MyTabBar({ state, descriptors, navigation }) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  if (isKeyboardVisible) {
    return null;
  }

  const getIcon = (routeName, isFocused) => {
    const color = isFocused ? 'white' : 'black';
    const size = 20;

    switch (routeName) {
      case 'Home':
        return <MaterialCommunityIcons name="home" size={size} color={color} />;
      case 'Matches':
        return <FontAwesome5 name="heart" size={size} color={color} />;
      case 'Chats':
        return <MaterialCommunityIcons name="chat" size={size} color={color} />;
      case 'Profile':
        return <FontAwesome5 name="user" size={size} color={color} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[styles.tabButton, isFocused && styles.tabButtonFocused]}
          >
            {getIcon(route.name, isFocused)}
            <Text style={[styles.tabButtonText, isFocused && { color: '#ffffff' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 70,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: "lightgrey",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  tabButton: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabButtonText: {
    fontSize: 12,
    color: 'black',
    textTransform: 'uppercase',
    marginTop: 3,
    fontWeight: '400',
  },
  tabButtonFocused: {
    backgroundColor: '#ff0000',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

