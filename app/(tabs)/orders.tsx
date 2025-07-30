import { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { OrderCard } from '../../components/OrderCard';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Order } from '../../types';
import { confirmLogout } from '../../utils/confirmLogout';

import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';
import { OrderDetailsModal } from '../../components/modals/OrderDetailsModal';
import { OrderNotesModal } from '../../components/modals/OrderNotesModal';
import { OrderStatusModal } from '../../components/modals/OrderStatusModal';



export default function OrdersScreen() {
  const { orders, updateOrder, deleteOrder, loading, userReady } = useData();
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [hoursToAdd, setHoursToAdd] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [orderNotes, setOrderNotes] = useState<string[]>([]);
  const [editedClientName, setEditedClientName] = useState('');
  const [editedJobTitle, setEditedJobTitle] = useState('');
  const [editedDeadline, setEditedDeadline] = useState('');
  const [editedEstimatedHours, setEditedEstimatedHours] = useState('');
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);




  // Filter out completed orders and sort by deadline
  const activeOrders = orders
    .filter(order => order.status !== 'complete')
    .sort((a, b) => {
      // Prioritize orders with deadlines first
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      if (a.deadline && b.deadline) {
        return a.deadline.getTime() - b.deadline.getTime();
      }
      // If no deadlines, sort by date received
      return a.dateReceived.getTime() - b.dateReceived.getTime();
    });

  const onRefresh = async () => {
    setRefreshing(true);
    // Data is real-time, so just simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setEditedClientName(order.clientName);
    setEditedJobTitle(order.jobTitle);
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
        deadline: editedDeadline ? new Date(editedDeadline) : undefined,
        estimatedHours: parseFloat(editedEstimatedHours) || 0,
        notes: orderNotes,
      });
      
      setModalVisible(false);
      setSelectedOrder(null);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to update order details',
      });
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
      Toast.show({
        type: 'success',
        text1: 'Note added to order',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to add note',
      });
    }
  };
  

  

  const handleRequestDeleteOrder = () => {
    setConfirmDeleteVisible(true);
  };
  
  const confirmDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await deleteOrder(selectedOrder.id); // 🔥 This should fully delete it from Firestore/DB
      setModalVisible(false);
      setConfirmDeleteVisible(false);
      setSelectedOrder(null);
      Toast.show({
        type: 'success',
        text1: 'Order permanently deleted',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete order',
      });
    }
  };
  
  
  
  
  

  const handleStatusUpdate = async (status: Order['status']) => {
    if (!selectedOrder) return;

    try {
      await updateOrder(selectedOrder.id, { status });
      setSelectedOrder({
        ...selectedOrder,
        status, // locally update selectedOrder so UI updates
      });
      Toast.show({
        type: 'success',
        text1: 'Order status updated',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update order status',
      });
    }
};




const handleAddHours = async () => {
  if (!selectedOrder || !hoursToAdd) return;

  const additionalHours = parseFloat(hoursToAdd);
  if (isNaN(additionalHours) || additionalHours < 0) {
    Toast.show({
      type: 'error',
      text1: 'Please enter a valid number of hours',
    });
    return;
  }

  try {
    const newHoursCompleted = selectedOrder.hoursCompleted + additionalHours;
    await updateOrder(selectedOrder.id, { 
      hoursCompleted: newHoursCompleted,
      status: newHoursCompleted >= selectedOrder.estimatedHours ? 'complete' : 'started'
    });
    setHoursToAdd('');
    setStatusModalVisible(false); // ✅ Close the correct modal
    setSelectedOrder(null);
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Failed to update hours',
    });
  }
};


  const handleLogout = () => {
    confirmLogout(logout);
  };
  

  if (!userReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading orders...</Text>
      </View>
    );
  }


  const renderOrder = ({ item }: { item: Order }) => (
    <OrderCard order={item} onPress={() => handleOrderPress(item)} />
  );

  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {activeOrders.length} Active Orders
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active orders</Text>
            <Text style={styles.emptySubtext}>
              All orders are completed or add new orders in the Manage tab
            </Text>
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
        editedDeadline={editedDeadline}
        setEditedDeadline={setEditedDeadline}
        editedEstimatedHours={editedEstimatedHours}
        setEditedEstimatedHours={setEditedEstimatedHours}
        onSave={handleUpdateOrderDetails}
        onOpenNotes={() => setNotesModalVisible(true)}
        onOpenStatus={() => setStatusModalVisible(true)}
        onDeleteRequest={handleRequestDeleteOrder}
      />



      <OrderNotesModal
        visible={notesModalVisible}
        onClose={() => setNotesModalVisible(false)}
        notesInput={notesInput}
        setNotesInput={setNotesInput}
        orderNotes={orderNotes}
        onAddNote={handleAddNote}
      />

      

      <OrderStatusModal
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        selectedOrder={selectedOrder}
        hoursToAdd={hoursToAdd}
        setHoursToAdd={setHoursToAdd}
        onAddHours={handleAddHours}
        onStatusChange={handleStatusUpdate}
      />



      <ConfirmDeleteModal
        visible={confirmDeleteVisible}
        onCancel={() => setConfirmDeleteVisible(false)}
        onConfirm={confirmDeleteOrder}
      />




    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
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
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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