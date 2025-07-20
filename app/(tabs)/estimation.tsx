import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OrderCard } from '../../components/OrderCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useData } from '../../contexts/DataContext';
import { WorkPreferences } from '../../types';
import { calculateEstimatedCompletions } from '../../utils/completionCalculator';

export default function EstimationScreen() {
  const { orders, workPreferences, updateWorkPreferences, loading, userReady } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [preferences, setPreferences] = useState<WorkPreferences>(workPreferences);

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

  const handleSavePreferences = () => {
    updateWorkPreferences(preferences);
    setModalVisible(false);
  };

  const toggleDayOff = (day: number) => {
    setPreferences(prev => ({
      ...prev,
      daysOff: prev.daysOff.includes(day)
        ? prev.daysOff.filter(d => d !== day)
        : [...prev.daysOff, day],
    }));
  };

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

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Work Preferences</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Work Schedule</Text>

            <Input
              label="Days Per Week"
              value={preferences.daysPerWeek.toString()}
              onChangeText={(text) => setPreferences(prev => ({
                ...prev,
                daysPerWeek: parseInt(text) || 1,
              }))}
              keyboardType="numeric"
            />

            <Input
              label="Hours Per Day"
              value={preferences.hoursPerDay.toString()}
              onChangeText={(text) => setPreferences(prev => ({
                ...prev,
                hoursPerDay: parseFloat(text) || 1,
              }))}
              keyboardType="numeric"
            />

            <Text style={styles.sectionTitle}>Days Off</Text>
            <Text style={styles.sectionSubtitle}>Select your regular days off</Text>

            <View style={styles.daysContainer}>
              {dayNames.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    preferences.daysOff.includes(index) && styles.dayButtonSelected,
                  ]}
                  onPress={() => toggleDayOff(index)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    preferences.daysOff.includes(index) && styles.dayButtonTextSelected,
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Save Preferences"
              onPress={handleSavePreferences}
              style={styles.saveButton}
            />
          </ScrollView>
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
  settingsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#8B4513',
  },
  settingsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  workInfoContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  workInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dayButtonSelected: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  saveButton: {
    marginTop: 20,
  },
});