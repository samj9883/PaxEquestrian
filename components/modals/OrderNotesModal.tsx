import React, { useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../common/Button';

interface Props {
  notesInput: string;
  setNotesInput: (text: string) => void;
  orderNotes: string[];
  onAddNote: () => void;
}

export const OrderNotesModal = ({
  notesInput,
  setNotesInput,
  orderNotes,
  onAddNote,
}: Props) => {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [orderNotes]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.innerContainer}>
        {/* Scrollable Notes Feed */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {orderNotes.map((note, index) => {
            const [timestamp, ...rest] = note.split(': ');
            const message = rest.join(': ');
            return (
              <View key={index} style={styles.messageBubble}>
                <Text style={styles.messageText}>{message}</Text>
                <Text style={styles.timestampText}>{timestamp}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Fixed Input Box */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type a note..."
            value={notesInput}
            onChangeText={setNotesInput}
            style={styles.textInput}
            placeholderTextColor="#9CA3AF"
            returnKeyType="send"
            onSubmitEditing={onAddNote}
          />
          <Button title="Send" onPress={onAddNote} style={styles.sendButton} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  innerContainer: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 16,
    justifyContent: 'flex-start',
  },
  messageBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom:30,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});