import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

const EMOJIS = ["😊", "😂", "🥰", "😍", "😒", "😭", "😩", "😤", "👍", "❤️", "🎉", "✨"];

const EmojiPicker = ({ visible, onClose, onEmojiSelect }) => (
  <Modal
    transparent
    visible={visible}
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
      <View style={styles.emojiPickerContainer}>
        <FlatList
          data={EMOJIS}
          numColumns={6}
          renderItem={({ item: emoji }) => (
            <TouchableOpacity
              style={styles.emojiItem}
              onPress={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiPickerContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '40%',
  },
  emojiItem: {
    padding: 10,
    flex: 1,
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
});

export default EmojiPicker;