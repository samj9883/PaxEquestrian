import { useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { OrderCard } from '../../components/OrderCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Order } from '../../types';
import { confirmLogout } from '../../utils/confirmLogout';




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

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
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

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
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

            <Button
              title="Save Order Details"
              onPress={handleUpdateOrderDetails}
              style={{ marginTop: 16 }}
            />

            <Button
              title="Manage Notes"
              onPress={() => setNotesModalVisible(true)}
              style={{ marginTop: 24 }}
            />

            <Button
              title="Update Status / Hours"
              onPress={() => setStatusModalVisible(true)}
              style={{ marginTop: 12 }}
            />

            <Button
              title="Delete Order"
              onPress={handleRequestDeleteOrder}
              style={{ marginTop: 32, backgroundColor: '#DC2626' }}
            />
          </ScrollView>
        </View>
      </Modal>



      <Modal visible={notesModalVisible} animationType="slide" presentationStyle="formSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Notes</Text>
            <TouchableOpacity onPress={() => setNotesModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Input label="New Note" value={notesInput} onChangeText={setNotesInput} />
            <Button title="Add Note" onPress={handleAddNote} style={{ marginTop: 12 }} />
            {orderNotes.slice().reverse().map((note, index) => (
              <Text key={index} style={{ fontSize: 12, color: '#555', marginTop: 8 }}>{note}</Text>
            ))}
          </ScrollView>
        </View>
      </Modal>


      <Modal visible={statusModalVisible} animationType="slide" presentationStyle="formSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Status & Hours</Text>
            <TouchableOpacity onPress={() => setStatusModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.sectionTitle}>Estimated Hours: {selectedOrder?.estimatedHours}</Text>
            <Text style={styles.sectionTitle}>Hours Completed: {selectedOrder?.hoursCompleted}</Text>
            <Input label="Hours to Add" value={hoursToAdd} onChangeText={setHoursToAdd} placeholder="0.0" keyboardType="numeric" />
            <Button title="Add Hours" onPress={handleAddHours} style={styles.addHoursButton} />

            <Text style={styles.sectionTitle}>Update Status</Text>
            <View style={styles.statusButtons}>
              <Button title="Waiting" onPress={() => handleStatusUpdate('waiting')} variant={selectedOrder?.status === 'waiting' ? 'primary' : 'secondary'} style={styles.statusButton} />
              <Button title="Started" onPress={() => handleStatusUpdate('started')} variant={selectedOrder?.status === 'started' ? 'primary' : 'secondary'} style={styles.statusButton} />
              <Button title="Complete" onPress={() => handleStatusUpdate('complete')} variant={selectedOrder?.status === 'complete' ? 'primary' : 'secondary'} style={styles.statusButton} />
            </View>
          </ScrollView>
        </View>
      </Modal>



      <Modal
          visible={confirmDeleteVisible}
          transparent
          animationType="fade"
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, width: '80%' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Confirm Delete</Text>
              <Text style={{ marginBottom: 20 }}>
                This action cannot be undone. Are you sure you want to permanently delete this order?
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button title="Cancel" onPress={() => setConfirmDeleteVisible(false)} />
                <Button title="Delete" onPress={confirmDeleteOrder} style={{ backgroundColor: '#DC2626' }} />
              </View>
            </View>
          </View>
        </Modal>




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