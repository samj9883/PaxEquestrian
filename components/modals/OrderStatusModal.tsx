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
  hoursToAdd: string;
  setHoursToAdd: (value: string) => void;
  onAddHours: () => void;
  onStatusChange: (status: Order['status']) => void;
};

export const OrderStatusModal: React.FC<Props> = ({
  visible,
  onClose,
  selectedOrder,
  hoursToAdd,
  setHoursToAdd,
  onAddHours,
  onStatusChange,
}) => {
  if (!selectedOrder) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Update Status & Hours</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.sectionTitle}>
            Estimated Hours: {selectedOrder.estimatedHours}
          </Text>
          <Text style={styles.sectionTitle}>
            Hours Completed: {selectedOrder.hoursCompleted}
          </Text>

          <Input
            label="Hours to Add"
            value={hoursToAdd}
            onChangeText={setHoursToAdd}
            placeholder="0.0"
            keyboardType="numeric"
          />

          <Button title="Add Hours" onPress={onAddHours} style={styles.addHoursButton} />

          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.statusButtons}>
            <Button
              title="Waiting"
              onPress={() => onStatusChange('waiting')}
              variant={selectedOrder.status === 'waiting' ? 'primary' : 'secondary'}
              style={styles.statusButton}
            />
            <Button
              title="Started"
              onPress={() => onStatusChange('started')}
              variant={selectedOrder.status === 'started' ? 'primary' : 'secondary'}
              style={styles.statusButton}
            />
            <Button
              title="Complete"
              onPress={() => onStatusChange('complete')}
              variant={selectedOrder.status === 'complete' ? 'primary' : 'secondary'}
              style={styles.statusButton}
            />
          </View>
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
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  addHoursButton: {
    marginTop: 12,
  },
});

