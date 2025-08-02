import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Client, Order } from '../../types';
import { generateInvoicePDF } from '../../utils/PDFprint';


interface Props {
  visible: boolean;
  onClose: () => void;
  client: Client | null;
  orders: Order[];
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  updateOrder: (id: string, data: Partial<Order>) => void;
}

const formatDate = (rawDate?: Date | Timestamp): string => {
  if (!rawDate) return '';
  const date = rawDate instanceof Timestamp ? rawDate.toDate() : rawDate;

  return !isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';
};

const getStatusColor = (status: Order['paymentStatus']): string => {
  switch (status) {
    case 'pending':
      return '#F8D7DA';
    case 'paid':
      return '#D4EDDA';
    default:
      return '#E0E0E0';
  }
};

const ClientDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  client,
  orders,
  updateClient,
  updateOrder,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);

  useEffect(() => {
    setEditedClient(client);
    setEditMode(false);
  }, [client]);

  const clientOrders = client ? orders.filter((order) => order.clientId === client.id) : [];
  const totalOrders = clientOrders.length;
  const completedOrders = clientOrders.filter(order => order.status === 'complete');
  const paidCompletedOrders = completedOrders.filter(order => order.paymentStatus === 'paid');
  const isSettled = completedOrders.length > 0 && paidCompletedOrders.length === completedOrders.length;

  const handleSaveClient = async () => {
    if (!editedClient || !client) return;

    try {
      await updateClient(client.id, {
        name: editedClient.name,
        email: editedClient.email,
        phone: editedClient.phone,
        address: editedClient.address,
        notes: editedClient.notes,
      });
      Toast.show({ type: 'success', text1: 'Client updated successfully' });
      onClose();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update client' });
    }
  };

  const markAsPaid = (orderId: string) => {
    updateOrder(orderId, { paymentStatus: 'paid' });
  };

  const renderOrderItem = (order: Order) => {
    const isComplete = order.status === 'complete';
    const completedDate = isComplete ? formatDate(order.dateCompleted) : '';
    const paymentColor = getStatusColor(order.paymentStatus);

    return (
      <View key={order.id} style={[styles.orderItem, { backgroundColor: paymentColor }]}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderTitle}>{order.jobTitle}</Text>
          <Text style={styles.paymentBadge}>{order.paymentStatus.toUpperCase()}</Text>
        </View>
        <Text>Status: {order.status}</Text>
        {completedDate && <Text>Completed: {completedDate}</Text>}

        {order.paymentStatus !== 'paid' && (
        <View style={styles.statusButtonGroup}>
            <TouchableOpacity onPress={() => markAsPaid(order.id)} style={styles.statusButton}>
            <Text style={{ color: '#000' }}>Mark as Paid</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => client && generateInvoicePDF(order, client)} style={styles.statusButton}>
                <Text style={{ color: '#000' }}>View Invoice</Text>
            </TouchableOpacity>

        </View>
        )}


      </View>
    );
  };

  const renderClientInfo = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <Text>Email: {client?.email || 'Not provided'}</Text>
        <Text>Phone: {client?.phone || 'Not provided'}</Text>
        <Text>Address: {client?.address || 'Not provided'}</Text>
        {client?.notes && <Text>Notes: {client.notes}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client Summary</Text>
        <Text>Total Orders: {totalOrders}</Text>
        <Text>Completed Orders: {completedOrders.length}</Text>
        <Text>Paid Completed Orders: {paidCompletedOrders.length}</Text>
        <Text style={{ color: isSettled ? 'green' : 'red' }}>Settled: {isSettled ? 'Yes' : 'No'}</Text>
      </View>

      <Button title="Edit Client" onPress={() => setEditMode(true)} style={{ marginVertical: 20 }} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Orders</Text>
        {clientOrders.length > 0 ? (
          clientOrders.map(renderOrderItem)
        ) : (
          <Text>No orders for this client.</Text>
        )}
      </View>
    </>
  );

  const renderEditForm = () => (
    <>
      <Text style={styles.sectionTitle}>Edit Client</Text>
      <Input
        label="Name"
        value={editedClient?.name || ''}
        onChangeText={(text) =>
          setEditedClient((prev) => prev && { ...prev, name: text })
        }
      />
      <Input
        label="Email"
        value={editedClient?.email || ''}
        onChangeText={(text) =>
          setEditedClient((prev) => prev && { ...prev, email: text })
        }
      />
      <Input
        label="Phone"
        value={editedClient?.phone || ''}
        onChangeText={(text) =>
          setEditedClient((prev) => prev && { ...prev, phone: text })
        }
      />
      <Input
        label="Address"
        value={editedClient?.address || ''}
        onChangeText={(text) =>
          setEditedClient((prev) => prev && { ...prev, address: text })
        }
        multiline
      />
      <Input
        label="Notes"
        value={editedClient?.notes || ''}
        onChangeText={(text) =>
          setEditedClient((prev) => prev && { ...prev, notes: text })
        }
        multiline
      />
      <View style={styles.editButtons}>
        <Button title="Cancel" variant="secondary" onPress={() => setEditMode(false)} />
        <Button title="Save" onPress={handleSaveClient} />
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{client?.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {!editMode ? renderClientInfo() : renderEditForm()}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ClientDetailsModal;

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  closeButtonText: { fontSize: 16 },
  modalContent: { padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  orderItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    textTransform: 'uppercase',
  },
  orderTitle: { fontWeight: '600', fontSize: 15 },
  statusButtonGroup: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#999',
    backgroundColor: '#FFF',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
