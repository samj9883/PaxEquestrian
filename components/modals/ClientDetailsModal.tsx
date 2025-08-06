// ClientDetailsModal.tsx — Refactored to work with OrderDetailsModalBase

import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Client, Order } from '../../types';
import { OrderDetailsModalBase } from './clientOrderDetails';

interface Props {
  visible: boolean;
  onClose: () => void;
  client: Client | null;
  orders: Order[];
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
}

const formatDate = (rawDate?: Date | Timestamp): string => {
  if (!rawDate) return '';
  const date = rawDate instanceof Timestamp ? rawDate.toDate() : rawDate;
  return !isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '';
};

const getStatusColor = (status: Order['paymentStatus']): string => {
  switch (status) {
    case 'pending': return '#F8D7DA';
    case 'paid': return '#D4EDDA';
    default: return '#E0E0E0';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [orderNotes, setOrderNotes] = useState<string[]>([]);
  const [hoursToAdd, setHoursToAdd] = useState('');
  const [editedJobTitle, setEditedJobTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedDeadline, setEditedDeadline] = useState('');
  const [editedEstimatedHours, setEditedEstimatedHours] = useState('');
  const [editedCost, setEditedCost] = useState('');
  const [editedClientPrice, setEditedClientPrice] = useState('');


  useEffect(() => {
    setEditedClient(client);
    setEditMode(false);
  }, [client]);

  const clientOrders = client ? orders.filter(o => o.clientId === client.id) : [];
  const filteredOrders = clientOrders.filter(order => order.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()));
  const completedOrders = clientOrders.filter(o => o.status === 'complete');
  const paidCompletedOrders = completedOrders.filter(o => o.paymentStatus === 'paid');
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

  const handleUpdateOrderDetails = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrder(selectedOrder.id, {
        jobTitle: editedJobTitle,
        description: editedDescription,
        deadline: editedDeadline ? new Date(editedDeadline) : undefined,
        estimatedHours: parseFloat(editedEstimatedHours) || 0,
        internalCost: parseFloat(editedCost) || 0,
        clientPrice: parseFloat(editedClientPrice) || 0,
        notes: orderNotes,
      });
      setOrderModalVisible(false);
      setSelectedOrder(null);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update order details' });
    }
  };
  

  const handleAddNote = async () => {
    if (!selectedOrder || !notesInput.trim()) return;
    const timestamp = new Date().toLocaleString();
    const newNote = `${timestamp}: ${notesInput.trim()}`;
    const updatedNotes = [...orderNotes, newNote];
    try {
      await updateOrder(selectedOrder.id, { notes: updatedNotes });
      setOrderNotes(updatedNotes);
      setNotesInput('');
      Toast.show({ type: 'success', text1: 'Note added to order' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to add note' });
    }
  };

  const handleStatusUpdate = async (status: Order['status']) => {
    if (!selectedOrder) return;
    try {
      const updates: Partial<Order> = { status };
      if (status === 'complete') {
        updates.dateCompleted = new Date();
        updates.paymentStatus = 'pending';
      }
      await updateOrder(selectedOrder.id, updates);
      setSelectedOrder({ ...selectedOrder, ...updates });
      Toast.show({ type: 'success', text1: 'Order status updated' });
      if (status === 'complete') {
        setOrderModalVisible(false);
        setSelectedOrder(null);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    }
  };

  const handlePaymentStatusUpdate = async (status: Order['paymentStatus']) => {
    if (!selectedOrder) return;
    try {
      await updateOrder(selectedOrder.id, { paymentStatus: status });
      setSelectedOrder({ ...selectedOrder, paymentStatus: status });
      Toast.show({ type: 'success', text1: 'Payment status updated' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update payment status' });
    }
  };
  

 

  const handleAddHours = async () => {
    if (!selectedOrder || !hoursToAdd) return;
    const additionalHours = parseFloat(hoursToAdd);
    if (isNaN(additionalHours) || additionalHours < 0) {
      Toast.show({ type: 'error', text1: 'Please enter a valid number of hours' });
      return;
    }
    try {
      const newHours = selectedOrder.hoursCompleted + additionalHours;
      await updateOrder(selectedOrder.id, {
        hoursCompleted: newHours,
        status: newHours >= selectedOrder.estimatedHours ? 'complete' : 'started',
      });
      setHoursToAdd('');
      setOrderModalVisible(false);
      setSelectedOrder(null);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update hours' });
    }
  };

  const confirmDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrder(selectedOrder.id, {}); // Soft delete or modify if using deleted flag
      setOrderModalVisible(false);
      setSelectedOrder(null);
      Toast.show({ type: 'success', text1: 'Order deleted' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to delete order' });
    }
  };

  const renderOrderItem = (order: Order) => {
    const completedDate = order.status === 'complete' ? formatDate(order.dateCompleted) : '';
    const paymentColor = getStatusColor(order.paymentStatus);

    return (
      <TouchableOpacity
        key={order.id}
        onPress={() => {
          setSelectedOrder(order);
          setOrderNotes(order.notes || []);
          setEditedJobTitle(order.jobTitle);
          setEditedDescription(order.description || '');
          setEditedDeadline(order.deadline ? order.deadline.toISOString().split('T')[0] : '');
          setEditedEstimatedHours(order.estimatedHours?.toString() || '');
          setEditedCost(order.internalCost?.toString() || '');
          setEditedClientPrice(order.clientPrice?.toString() || '');
          setOrderModalVisible(true);
        }}
        
      >
        <View style={[styles.orderItem, { backgroundColor: paymentColor }]}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderTitle}>{order.jobTitle}</Text>
            <Text style={styles.paymentBadge}>{order.paymentStatus.toUpperCase()}</Text>
          </View>
          <Text>Status: {order.status}</Text>
          {completedDate && <Text>Completed: {completedDate}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{client?.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {!editMode ? (
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
                <Text>Total Orders: {clientOrders.length}</Text>
                <Text>Completed Orders: {completedOrders.length}</Text>
                <Text>Paid Completed Orders: {paidCompletedOrders.length}</Text>
                <Text style={{ color: isSettled ? 'green' : 'red' }}>Settled: {isSettled ? 'Yes' : 'No'}</Text>
              </View>

              <Button title="Edit Client" onPress={() => setEditMode(true)} style={{ marginVertical: 20 }} />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Orders</Text>
                <TextInput
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(renderOrderItem)
                ) : (
                  <Text>No matching orders found.</Text>
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Edit Client</Text>
              <Input label="Name" value={editedClient?.name || ''} onChangeText={text => setEditedClient(prev => prev && { ...prev, name: text })} />
              <Input label="Email" value={editedClient?.email || ''} onChangeText={text => setEditedClient(prev => prev && { ...prev, email: text })} />
              <Input label="Phone" value={editedClient?.phone || ''} onChangeText={text => setEditedClient(prev => prev && { ...prev, phone: text })} />
              <Input label="Address" value={editedClient?.address || ''} onChangeText={text => setEditedClient(prev => prev && { ...prev, address: text })} multiline />
              <Input label="Notes" value={editedClient?.notes || ''} onChangeText={text => setEditedClient(prev => prev && { ...prev, notes: text })} multiline />
              <View style={styles.editButtons}>
                <Button title="Cancel" variant="secondary" onPress={() => setEditMode(false)} />
                <Button title="Save" onPress={handleSaveClient} />
              </View>
            </>
          )}
        </ScrollView>

        {selectedOrder && client && (
          <OrderDetailsModalBase
          visible={orderModalVisible}
          onClose={() => setOrderModalVisible(false)}
          order={selectedOrder}
          client={client}
          onMarkPaid={markAsPaid}
          onSave={handleUpdateOrderDetails}
          onAddNote={handleAddNote}
          notesInput={notesInput}
          setNotesInput={setNotesInput}
          orderNotes={orderNotes}
          hoursToAdd={hoursToAdd}
          setHoursToAdd={setHoursToAdd}
          onAddHours={handleAddHours}
          onStatusChange={handleStatusUpdate}
          onPaymentStatusChange={handlePaymentStatusUpdate}  
          onDeleteRequest={confirmDeleteOrder}
          jobTitle={editedJobTitle}
          setJobTitle={setEditedJobTitle}
          description={editedDescription}
          setDescription={setEditedDescription}
          deadline={editedDeadline}
          setDeadline={setEditedDeadline}
          estimatedHours={editedEstimatedHours}
          setEstimatedHours={setEditedEstimatedHours}
          internalCost={editedCost}
          setInternalCost={setEditedCost}
          clientPrice={editedClientPrice}
          setClientPrice={setEditedClientPrice}
        />
        
        
        )}
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
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
});
