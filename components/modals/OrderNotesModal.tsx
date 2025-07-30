import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface Props {
  visible: boolean;
  onClose: () => void;
  notesInput: string;
  setNotesInput: (text: string) => void;
  orderNotes: string[];
  onAddNote: () => void;
}

export const OrderNotesModal = ({
  visible,
  onClose,
  notesInput,
  setNotesInput,
  orderNotes,
  onAddNote,
}: Props) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Order Notes</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Input label="New Note" value={notesInput} onChangeText={setNotesInput} />
          <Button title="Add Note" onPress={onAddNote} style={{ marginTop: 12 }} />
          {orderNotes.slice().reverse().map((note, index) => (
            <Text key={index} style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
              {note}
            </Text>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};
