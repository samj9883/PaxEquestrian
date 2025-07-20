import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OrderCard } from '../../components/OrderCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Order } from '../../types';

export default function OrdersScreen() {
  const { orders, updateOrder, loading, userReady } = useData();
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [hoursToAdd, setHoursToAdd] = useState('');

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
    setModalVisible(true);
  };

  const handleStatusUpdate = async (status: Order['status']) => {
    if (!selectedOrder) return;

    try {
      await updateOrder(selectedOrder.id, { status });
      setModalVisible(false);
      setSelectedOrder(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleAddHours = async () => {
    if (!selectedOrder || !hoursToAdd) return;

    const additionalHours = parseFloat(hoursToAdd);
    if (isNaN(additionalHours) || additionalHours < 0) {
      Alert.alert('Error', 'Please enter a valid number of hours');
      return;
    }

    try {
      const newHoursCompleted = selectedOrder.hoursCompleted + additionalHours;
      await updateOrder(selectedOrder.id, { 
        hoursCompleted: newHoursCompleted,
        status: newHoursCompleted >= selectedOrder.estimatedHours ? 'complete' : 'started'
      });
      setHoursToAdd('');
      setModalVisible(false);
      setSelectedOrder(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update hours');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Order: {selectedOrder?.orderNumber}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <View style={styles.statusButtons}>
              <Button
                title="Waiting"
                onPress={() => handleStatusUpdate('waiting')}
                variant={selectedOrder?.status === 'waiting' ? 'primary' : 'secondary'}
                style={styles.statusButton}
              />
              <Button
                title="Started"
                onPress={() => handleStatusUpdate('started')}
                variant={selectedOrder?.status === 'started' ? 'primary' : 'secondary'}
                style={styles.statusButton}
              />
              <Button
                title="Complete"
                onPress={() => handleStatusUpdate('complete')}
                variant={selectedOrder?.status === 'complete' ? 'primary' : 'secondary'}
                style={styles.statusButton}
              />
            </View>

            <Text style={styles.sectionTitle}>Add Hours Worked</Text>
            <Input
              label="Hours to Add"
              value={hoursToAdd}
              onChangeText={setHoursToAdd}
              placeholder="0.0"
              keyboardType="numeric"
            />
            <Button
              title="Add Hours"
              onPress={handleAddHours}
              style={styles.addHoursButton}
            />
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