import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../common/Button';

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmDeleteModal: React.FC<Props> = ({
  onCancel,
  onConfirm,
}) => {
  return (
    <View style={styles.modalBox}>
      <Text style={styles.title}>Confirm Delete</Text>
      <Text style={styles.message}>
        This action cannot be undone. Are you sure you want to permanently delete this order?
      </Text>
      <View style={styles.buttonRow}>
        <Button title="Cancel" onPress={onCancel} />
        <Button title="Delete" onPress={onConfirm} style={{ backgroundColor: '#DC2626' }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    marginBottom: 20,
    fontSize: 14,
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
