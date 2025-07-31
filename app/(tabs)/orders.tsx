import { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { OrderDetailsModal } from '../../components/modals/OrderDetailsModal';
import { OrderCard } from '../../components/OrderCard';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Order } from '../../types';
import { confirmLogout } from '../../utils/confirmLogout';

export default function OrdersScreen() {
  const { orders, updateOrder, deleteOrder, loading, userReady } = useData();
  const { logout } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [notesInput, setNotesInput] = useState('');
  const [orderNotes, setOrderNotes] = useState<string[]>([]);

  const [hoursToAdd, setHoursToAdd] = useState('');
  const [editedClientName, setEditedClientName] = useState('');
  const [editedJobTitle, setEditedJobTitle] = useState('');
  const [editedDeadline, setEditedDeadline] = useState('');
  const [editedEstimatedHours, setEditedEstimatedHours] = useState('');
  const [editedDescription, setEditedDescription] = useState('');


  const activeOrders = orders
    .filter((order) => order.status !== 'complete')
    .sort((a, b) => {
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime();
      return a.dateReceived.getTime() - b.dateReceived.getTime();
    });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setEditedClientName(order.clientName);
    setEditedJobTitle(order.jobTitle);
    setEditedDescription(order.description || ''); 
    setEditedDeadline(order.deadline ? order.deadline.toISOString().split('T')[0] : '');
    setEditedEstimatedHours(order.estimatedHours.toString());
    setOrderNotes(order.notes || []);
    setModalVisible(true);
  };

  const handleUpdateOrderDetails = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrder(selectedOrder.id, {
        clientName: editedClientName,
        jobTitle: editedJobTitle,
        description: editedDescription, 
        deadline: editedDeadline ? new Date(editedDeadline) : undefined,
        estimatedHours: parseFloat(editedEstimatedHours) || 0,
        notes: orderNotes,
      });
      setModalVisible(false);
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
      await updateOrder(selectedOrder.id, { status });
      setSelectedOrder({ ...selectedOrder, status });
      Toast.show({ type: 'success', text1: 'Order status updated' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
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
      setModalVisible(false);
      setSelectedOrder(null);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update hours' });
    }
  };

  const confirmDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await deleteOrder(selectedOrder.id);
      setModalVisible(false);
      setSelectedOrder(null);
      Toast.show({ type: 'success', text1: 'Order permanently deleted' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to delete order' });
    }
  };

  const handleLogout = () => confirmLogout(logout);

  if (!userReady) {
    return <View style={styles.loadingContainer}><Text>Checking authentication...</Text></View>;
  }

  if (loading) {
    return <View style={styles.loadingContainer}><Text>Loading orders...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{activeOrders.length} Active Orders</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeOrders}
        renderItem={({ item }) => <OrderCard order={item} onPress={() => handleOrderPress(item)} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active orders</Text>
            <Text style={styles.emptySubtext}>All orders are completed or add new orders in the Manage tab</Text>
          </View>
        }
      />

      <OrderDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedOrder={selectedOrder}
        editedClientName={editedClientName}
        setEditedClientName={setEditedClientName}
        editedJobTitle={editedJobTitle}
        setEditedJobTitle={setEditedJobTitle}
        editedDescription={editedDescription}                             
        setEditedDescription={setEditedDescription}                       
        editedDeadline={editedDeadline}
        setEditedDeadline={setEditedDeadline}
        editedEstimatedHours={editedEstimatedHours}
        setEditedEstimatedHours={setEditedEstimatedHours}
        onSave={handleUpdateOrderDetails}
        onAddNote={handleAddNote}
        notesInput={notesInput}
        setNotesInput={setNotesInput}
        orderNotes={orderNotes}
        hoursToAdd={hoursToAdd}
        setHoursToAdd={setHoursToAdd}
        onAddHours={handleAddHours}
        onStatusChange={handleStatusUpdate}
        onDeleteRequest={confirmDeleteOrder}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },
  logoutText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  listContent: { paddingBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
