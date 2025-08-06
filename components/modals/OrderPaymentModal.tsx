import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Client, Order } from '../../types';
import { generateInvoicePDF } from '../../utils/PDFprint';
import { Button } from '../common/Button';


type Props = {
  selectedOrder: Order | null;
  onStatusChange: (status: Order['status']) => void;
  onPaymentStatusChange: (status: Order['paymentStatus']) => void;
  client: Client;
};

export const OrderPaymentModal: React.FC<Props> = ({
  selectedOrder,
  onStatusChange,
  onPaymentStatusChange,
  client,
}) => {
  if (!selectedOrder) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionTitle}>Update Job Status</Text>
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

        <Text style={styles.sectionTitle}>Update Payment Status</Text>
          <View style={styles.statusButtons}>
            <Button
              title="incomplete"
              onPress={() => onPaymentStatusChange('incomplete')}
              variant={selectedOrder.paymentStatus === 'incomplete' ? 'primary' : 'secondary'}
              style={styles.statusButton}
            />
            <Button
              title="Pending"
              onPress={() => onPaymentStatusChange('pending')}
              variant={selectedOrder.paymentStatus === 'pending' ? 'primary' : 'secondary'}
              style={styles.statusButton}
            />
            <Button
              title="Paid"
              onPress={() => onPaymentStatusChange('paid')}
              variant={selectedOrder.paymentStatus === 'paid' ? 'primary' : 'secondary'}
              style={styles.statusButton}
            />
          </View>

          <Button
            title="Print Invoice"
            onPress={() => generateInvoicePDF(selectedOrder, client)}
            variant="primary" 
            style={{ marginTop: 16 }}
          />




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
