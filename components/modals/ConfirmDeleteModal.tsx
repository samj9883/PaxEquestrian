import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../common/Button';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmDeleteModal: React.FC<Props> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000088',
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
