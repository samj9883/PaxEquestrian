import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Order } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedOrder: Order | null;
  editedClientName: string;
  setEditedClientName: (value: string) => void;
  editedJobTitle: string;
  setEditedJobTitle: (value: string) => void;
  editedDeadline: string;
  setEditedDeadline: (value: string) => void;
  editedEstimatedHours: string;
  setEditedEstimatedHours: (value: string) => void;
  onSave: () => void;
  onOpenNotes: () => void;
  onOpenStatus: () => void;
  onDeleteRequest: () => void;
};

export const OrderDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  selectedOrder,
  editedClientName,
  setEditedClientName,
  editedJobTitle,
  setEditedJobTitle,
  editedDeadline,
  setEditedDeadline,
  editedEstimatedHours,
  setEditedEstimatedHours,
  onSave,
  onOpenNotes,
  onOpenStatus,
  onDeleteRequest,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedOrder?.clientName} | {selectedOrder?.jobTitle}
            </Text>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Order Details</Text>

          <Input
            label="Client Name"
            value={editedClientName}
            onChangeText={setEditedClientName}
          />
          <Input
            label="Job Title"
            value={editedJobTitle}
            onChangeText={setEditedJobTitle}
          />
          <Input
            label="Deadline (YYYY-MM-DD)"
            value={editedDeadline}
            onChangeText={setEditedDeadline}
          />
          <Input
            label="Estimated Hours"
            value={editedEstimatedHours}
            onChangeText={setEditedEstimatedHours}
            keyboardType="numeric"
          />

          <Button title="Save Order Details" onPress={onSave} style={{ marginTop: 16 }} />
          <Button title="Manage Notes" onPress={onOpenNotes} style={{ marginTop: 24 }} />
          <Button title="Update Status / Hours" onPress={onOpenStatus} style={{ marginTop: 12 }} />
          <Button
            title="Delete Order"
            onPress={onDeleteRequest}
            style={{ marginTop: 32, backgroundColor: '#DC2626' }}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 20,
  },
});
