// components/modals/EstimationModal.tsx
import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useData } from '../../contexts/DataContext';
import { WorkPreferences } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const EstimationModal: React.FC<Props> = ({ visible, onClose }) => {
  const { workPreferences, updateWorkPreferences } = useData();
  const [preferences, setPreferences] = useState<WorkPreferences>(workPreferences);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    setPreferences(workPreferences);
  }, [workPreferences]);

  const toggleDayOff = (day: number) => {
    setPreferences(prev => ({
      ...prev,
      daysOff: prev.daysOff.includes(day)
        ? prev.daysOff.filter(d => d !== day)
        : [...prev.daysOff, day],
    }));
  };

  const toggleCustomDayOff = (date: Date) => {
    const key = date.toISOString().split('T')[0];
    const exists = preferences.customDaysOff.some(d => d.toISOString().split('T')[0] === key);

    setPreferences(prev => ({
      ...prev,
      customDaysOff: exists
        ? prev.customDaysOff.filter(d => d.toISOString().split('T')[0] !== key)
        : [...prev.customDaysOff, date],
    }));
  };

  const getMarkedDates = () => {
    const result: Record<string, any> = {};
    preferences.customDaysOff.forEach(date => {
      const key = date.toISOString().split('T')[0];
      result[key] = { selected: true, selectedColor: '#141414' };
    });
    return result;
  };

  const handleSavePreferences = () => {
    updateWorkPreferences(preferences);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Work Preferences</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.sectionTitle}>Standard Work Week</Text>

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

          <Text style={styles.sectionTitle}>Regular Days Off</Text>
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
                <Text
                  style={[
                    styles.dayButtonText,
                    preferences.daysOff.includes(index) && styles.dayButtonTextSelected,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Book Custom Days Off</Text>
          <Text style={styles.sectionSubtitle}>Tap dates below to toggle days off</Text>

          <Calendar
            markedDates={getMarkedDates()}
            onDayPress={(day) => toggleCustomDayOff(new Date(day.dateString))}
            enableSwipeMonths
          />

          <Button
            title="Save Preferences"
            onPress={handleSavePreferences}
            style={styles.saveButton}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: { fontSize: 16, color: '#6B7280' },
  modalContent: { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
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
    backgroundColor: '#141414',
    borderColor: '#141414',
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
