import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Text, Platform, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import Message from './Message';
import EmojiPicker from './EmojiPicker';

const ChatRoom = ({ route }) => {
  const { receiverId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const [userData, storedToken] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token')
        ]);

        if (!mounted) return;

        if (userData && storedToken) {
          const parsedUserData = JSON.parse(userData);
          const formattedToken = storedToken.replace(/^"|"$/g, '');

          setUserId(parsedUserData.id);
          setToken(formattedToken);

          // Initialize socket after getting user data
          initializeSocket(parsedUserData.id);

          // Fetch messages after getting credentials
          await fetchMessages(formattedToken, parsedUserData.id);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
    };
  }, [receiverId]);

  const initializeSocket = (currentUserId) => {
    socketRef.current = io('http://10.105.51.160:3000', {
      transports: ['websocket'],
      query: { userId: currentUserId }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('receiveMessage', (newMessage) => {
      if (newMessage && (newMessage.senderId === receiverId || newMessage.senderId === currentUserId)) {
        setMessages(prevMessages => {
          // Check for duplicate messages
          if (prevMessages.some(msg => msg.id === newMessage.id)) {
            return prevMessages;
          }

          const messageWithIsFromMe = {
            ...newMessage,
            isFromMe: newMessage.senderId === currentUserId,
            id: newMessage.id || Date.now().toString()
          };

          const newMessages = [...prevMessages, messageWithIsFromMe];

          // Ensure messages are sorted by timestamp
          return newMessages.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });
  };

  const fetchMessages = async (currentToken, currentUserId) => {
    try {
      const response = await fetch(`http://10.105.51.160:3000/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      const data = await response.json();

      if (data?.messages) {
        const processedMessages = data.messages.map(msg => ({
          ...msg,
          isFromMe: String(msg.senderId) === String(currentUserId),
          id: msg.id || `${msg.senderId}-${msg.timestamp}`
        }));

        // Sort messages by timestamp
        const sortedMessages = processedMessages.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setMessages(sortedMessages);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !socketRef.current) return;

    const messageId = Date.now().toString();
    const timestamp = new Date().toISOString();

    const newMessageData = {
      id: messageId,
      receiverId,
      message: message.trim(),
      senderId: userId,
      timestamp,
      isFromMe: true // Always true for sent messages
    };

    // Add message to local state immediately
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, newMessageData];
      return newMessages.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });

    setMessage('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await fetch('http://10.105.51.160:3000/send-message', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          message: newMessageData.message,
          senderId: userId,
          timestamp
        }),
      });

      if (response.ok) {
        socketRef.current.emit('sendMessage', newMessageData);
      } else {
        // Remove failed message
        setMessages(prevMessages =>
          prevMessages.filter(msg => msg.id !== messageId)
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed message
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== messageId)
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ImageBackground 
        source={require('../../assets/Background1.png')} 
        style={styles.background}
        resizeMode="cover"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Message 
              message={item} 
              isFromMe={item.isFromMe}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Text style={styles.emojiButton}>😊</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        <EmojiPicker
          visible={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelect={(emoji) => setMessage(prev => prev + emoji)}
        />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  messagesList: {
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional: slight transparency for input area
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
    maxHeight: 100,
    backgroundColor: 'white',
  },
  sendButton: {
    backgroundColor: '#25D366',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#A8A8A8',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emojiButton: {
    fontSize: 24,
  },
});

export default ChatRoom;
