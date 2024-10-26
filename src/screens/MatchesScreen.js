import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import styles from '../../assets/styles';
import Icon from './Icons.js';
import bg from "../../assets/Background.png";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Matches = () => {
  const [token, setToken] = useState('');
  const [matches, setMatches] = useState([]);
  const [requestStatus, setRequestStatus] = useState({});  // State to track request status for each match
  const flatListRef = useRef(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken.replace(/^"|"$/g, ''));  // Remove any extra quotes around token
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
      const response = await axios.get('https://lol-2eal.onrender.com/matches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.matches) {
        setMatches(response.data.matches);
        checkAllRequestStatuses(response.data.matches);  // Check request status for each match
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const checkAllRequestStatuses = async (matches) => {
    const statuses = {};
    for (const match of matches) {
      statuses[match.id] = await checkRequestStatus(match.id);
    }
    setRequestStatus(statuses);
  };

  const checkRequestStatus = async (receiverId) => {
    try {
      const response = await axios.get(
        `https://lol-2eal.onrender.com/promnight/check/${receiverId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.promRequests.length > 0;  // Return true if there's a pending request
    } catch (error) {
      console.error("Error checking request status:", error);
      return false;
    }
  };

  const requestPromNight = async (receiverId) => {
    if (requestStatus[receiverId]) {
      Alert.alert("Info", "Request Already Sent");
      return;
    }

    try {
      const response = await axios.post(
        'https://lol-2eal.onrender.com/requestPromNight',
        { receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", response.data.message);
      setRequestStatus((prevStatus) => ({
        ...prevStatus,
        [receiverId]: true,
      }));
    } catch (error) {
      if (error.response) {
        console.error("Server response error:", error.response.data);
        Alert.alert("Error", error.response.data.message || "Failed to send prom night request");
      } else if (error.request) {
        console.error("Request was made but no response received:", error.request);
        Alert.alert("Error", "No response from server");
      } else {
        console.error("Unexpected error:", error.message);
        Alert.alert("Error", "An unexpected error occurred");
      }
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
            marginTop: 19
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
              <View style={{ width: 280, margin: 10, marginTop: 148 }}>
                <TouchableOpacity>
                  <Image
                    source={{ uri: item.profile_image }}
                    style={{ height: 340, borderRadius: 15 }}
                  />
                  <Text style={{
                    textAlign: 'center',
                    marginTop: 10,
                    fontSize: 18,
                    color: 'white'
                  }}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#ff4081',
                      padding: 10,
                      borderRadius: 10,
                      marginTop: 10,
                    }}
                    onPress={() => requestPromNight(item.id)}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>
                      {requestStatus[item.id] ? "Request Already Sent" : "Request to Prom"}
                    </Text>
                  </TouchableOpacity>
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
