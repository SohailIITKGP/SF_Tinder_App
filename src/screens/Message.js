import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Message = ({ message, isFromMe }) => {
  return (
    <View style={[
      styles.messageWrapper,
      isFromMe ? styles.sentMessageWrapper : styles.receivedMessageWrapper
    ]}>
      <View style={[
        styles.messageContainer,
        isFromMe ? styles.sentMessage : styles.receivedMessage
      ]}>
        <Text style={styles.messageText}>{message.message}</Text>
        <Text style={styles.timestampText}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 2,
  },
  sentMessageWrapper: {
    alignItems: 'flex-end',
  },
  receivedMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
  },
  sentMessage: {
    backgroundColor: '#DCF8C6',
  },
  receivedMessage: {
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  timestampText: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});

export default Message;