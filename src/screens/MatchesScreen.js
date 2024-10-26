import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Image,
} from 'react-native';
import styles from '../../assets/styles';
import CardItem from './CardItems.js';
import Icon from './Icons.js';
import bg from "../../assets/Background.png";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Matches = () => {
  const [token, setToken] = useState('');
  const [matches, setMatches] = useState([]);
  const flatListRef = useRef(null); 

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        } else {
          console.error("Token is missing or invalid");
        }
      } catch (error) {
        console.error('Failed to load token from AsyncStorage', error);
      }
    };
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchMatches();
    }
  }, [token]);

  const fetchMatches = async () => {
    try {
      const formattedToken = token.replace(/^"|"$/g, '');
      const response = await axios.get('http://10.105.51.160:3000/matches', {
        headers: { Authorization: `Bearer ${formattedToken}` },
      });
      if (response.data && response.data.matches) {
        setMatches(response.data.matches);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (flatListRef.current && matches.length > 0) {
        flatListRef.current.scrollToOffset({
          offset: Math.floor(Math.random() * matches.length) * 300,
          animated: true,
        });
      }
    }, 3000); 

    return () => clearInterval(intervalId); 
  }, [matches]);

  return (
    <ImageBackground source={bg} style={styles.bg}>
      <View style={styles.containerMatches}>
        <TouchableOpacity>
          <Text style={styles.icon}>
            <Icon name="optionsV" />
          </Text>
        </TouchableOpacity>

        {matches.length === 0 ? ( 
          <Text style={{
            color: 'white',
            fontSize: 18,
            textAlign: 'center',
            marginTop: 20
          }}>
            Oops, no match for you
          </Text>
        ) : (
          <FlatList
            ref={flatListRef} 
            data={matches}
            keyExtractor={(item) => item.id.toString()}
            horizontal={true} 
            showsHorizontalScrollIndicator={false} 
            renderItem={({ item }) => (
              <View style={{ width: 280, margin: 10,marginTop:148 }}>
                <TouchableOpacity>
                  <Image
                    source={{ uri: item.profile_image }}
                    style={{ height:340, borderRadius: 15 }} 
                  />
                  <Text style={{
                    textAlign: 'center',
                    marginTop: 10,
                    fontSize: 18,
                    color: 'white'
                  }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </ImageBackground>
  );
};

export default Matches;
