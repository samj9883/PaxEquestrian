// EstimationScreen.tsx
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EstimationModal } from '../../components/modals/estimationModal';
import { OrderCard } from '../../components/OrderCard';
import { useData } from '../../contexts/DataContext';
import { calculateEstimatedCompletions } from '../../utils/completionCalculator';

export default function EstimationScreen() {
  const { orders, workPreferences, loading, userReady } = useData();
  const [modalVisible, setModalVisible] = useState(false);

  if (!userReady) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.emptyText}>Checking authentication...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.emptyText}>Loading orders...</Text>
      </View>
    );
  }

  const estimations = calculateEstimatedCompletions(orders, workPreferences);
  const activeOrders = orders.filter(order => order.status !== 'complete');

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Completion Timeline</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.workInfoContainer}>
        <Text style={styles.workInfoTitle}>Current Work Schedule</Text>
        <Text style={styles.workInfoText}>
          {workPreferences.daysPerWeek} days/week • {workPreferences.hoursPerDay} hours/day
        </Text>
        <Text style={styles.workInfoText}>
          Days off: {workPreferences.daysOff.map(day => dayNames[day]).join(', ')}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeOrders.map((order) => {
          const estimation = estimations.find(est => est.orderId === order.id);
          return (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => {}}
              showEstimatedCompletion={true}
              estimatedDate={estimation?.estimatedDate}
            />
          );
        })}

        {activeOrders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active orders to estimate</Text>
            <Text style={styles.emptySubtext}>
              All orders are completed or add new orders in the Manage tab
            </Text>
          </View>
        )}
      </ScrollView>

      <EstimationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
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
  settingsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#8B4513',
  },
  settingsText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  workInfoContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workInfoTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  workInfoText: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
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
