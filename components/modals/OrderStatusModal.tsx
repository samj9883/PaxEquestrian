import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Order } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

type Props = {
  selectedOrder: Order | null;
  hoursToAdd: string;
  setHoursToAdd: (value: string) => void;
  onAddHours: () => void;
  onStatusChange: (status: Order['status']) => void;
};

export const OrderStatusModal: React.FC<Props> = ({
  selectedOrder,
  hoursToAdd,
  setHoursToAdd,
  onAddHours,
  onStatusChange,
}) => {
  if (!selectedOrder) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
