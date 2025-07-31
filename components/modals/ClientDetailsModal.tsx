import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Client, Order } from '../../types';

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
  let date: Date;

  if (rawDate instanceof Timestamp) {
    date = rawDate.toDate();
  } else {
    date = rawDate;
  }

  return !isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';
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

  const clientOrders = client
    ? orders.filter((order) => order.clientId === client.id)
    : [];

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

  const handleUpdatePaymentStatus = (
    orderId: string,
    newStatus: 'incomplete' | 'pending' | 'paid'
  ) => {
    updateOrder(orderId, { paymentStatus: newStatus });
  };

  const renderOrderItem = (order: Order) => {
    const isComplete = order.status === 'complete';
    const completedDate = isComplete ? formatDate(order.dateCompleted) : '';

    return (
      <View key={order.id} style={styles.orderItem}>
        <Text style={styles.orderTitle}>{order.jobTitle}</Text>
        <Text>Status: {order.status}</Text>
        <Text>Payment: {order.paymentStatus}</Text>
        {completedDate && <Text>Completed: {completedDate}</Text>}

        <View style={styles.statusButtonGroup}>
          {(['incomplete', 'pending', 'paid'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => handleUpdatePaymentStatus(order.id, status)}
              style={[
                styles.statusButton,
                order.paymentStatus === status && styles.selectedStatusButton,
              ]}
            >
              <Text
                style={{
                  color: order.paymentStatus === status ? '#FFF' : '#000',
                }}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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

      <Button
        title="Edit Client"
        onPress={() => setEditMode(true)}
        style={{ marginTop: 20, marginBottom: 20 }}
      />

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
        <Button
          title="Cancel"
          variant="secondary"
          onPress={() => setEditMode(false)}
        />
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
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  orderTitle: { fontWeight: '600', fontSize: 15, marginBottom: 4 },
  statusButtonGroup: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#999',
    marginRight: 6,
  },
  selectedStatusButton: {
    backgroundColor: '#A0522D',
    borderColor: '#A0522D',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
