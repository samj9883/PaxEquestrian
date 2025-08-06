import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Modal from 'react-native-modal';
import { Client, Order } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { OrderNotesModal } from './OrderNotesModal';
import { OrderPaymentModal } from './OrderPaymentModal';


const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const TabButton = ({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabButton, active && styles.activeTab]}>
    <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
);

type Section = 'details' | 'notes' | 'payment' | 'delete';

interface Props {
  visible: boolean;
  onClose: () => void;
  order: Order;
  client: Client;
  onMarkPaid: (orderId: string) => void;
  onSave: () => void;
  onAddNote: (note: string) => void;
  onAddHours: (hours: number) => void;
  onStatusChange: (status: Order['status']) => void;
  onDeleteRequest: () => void;
  notesInput: string;
  setNotesInput: (value: string) => void;
  orderNotes: string[];
  hoursToAdd: string;
  setHoursToAdd: (value: string) => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  deadline: string;
  setDeadline: (value: string) => void;
  estimatedHours: string;
  setEstimatedHours: (value: string) => void;
  internalCost: string;
  setInternalCost: (value: string) => void;
  clientPrice: string;
  setClientPrice: (value: string) => void;
  onPaymentStatusChange: (status: Order['paymentStatus']) => void;

}

export const OrderDetailsModalBase: React.FC<Props> = ({
  visible,
  onClose,
  order,
  client,
  onMarkPaid,
  onSave,
  onAddNote,
  onAddHours,
  onStatusChange,
  onDeleteRequest,
  notesInput,
  setNotesInput,
  orderNotes,
  hoursToAdd,
  setHoursToAdd,
  jobTitle,
  setJobTitle,
  description,
  setDescription,
  deadline,
  setDeadline,
  estimatedHours,
  setEstimatedHours,
  internalCost,
  setInternalCost,
  clientPrice,
  setClientPrice,
  onPaymentStatusChange, 
}) => {
  const [section, setSection] = useState<Section>('details');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddNote = () => {
    if (!notesInput.trim()) return;
    const timestamp = new Date().toLocaleString();
    const newNote = `${timestamp}: ${notesInput.trim()}`;
    onAddNote(newNote);
  };

  const handleAddHours = () => {
    const additionalHours = parseFloat(hoursToAdd);
    if (isNaN(additionalHours) || additionalHours <= 0) return;
    onAddHours(additionalHours);
  };

  const renderDetailsSection = () => {
    const content = (
      <ScrollView
        contentContainerStyle={styles.sectionContent}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Job Title"
          value={jobTitle}
          onChangeText={setJobTitle}
        />
  
        <Input
          label="Job Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
  
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Deadline</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={
                deadline
                  ? new Date(deadline).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => {
                const dateValue = e.target.value;
                if (dateValue) {
                  setDeadline(new Date(dateValue).toISOString());
                }
              }}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
                height: '48px',
                color: '#333',
                fontSize: '16px',
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: '#f9f9f9',
                  borderColor: '#ccc',
                  borderWidth: 1,
                }}
              >
                <Text style={{ color: '#333' }}>
                  {deadline
                    ? new Date(deadline).toLocaleDateString()
                    : 'Select deadline date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  display="default"
                  value={deadline ? new Date(deadline) : new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDeadline(selectedDate.toISOString());
                    }
                  }}
                />
              )}
            </>
          )}
        </View>
  
        <Input
          label="Estimated Hours"
          value={estimatedHours}
          onChangeText={setEstimatedHours}
          keyboardType="numeric"
        />
  
        <Input
          label="Cost (£)"
          value={internalCost}
          onChangeText={setInternalCost}
          keyboardType="numeric"
        />
  
        <Input
          label="Client Price (£)"
          value={clientPrice}
          onChangeText={setClientPrice}
          keyboardType="numeric"
        />
  
        <Button title="Save Order Details" onPress={onSave} style={{ marginTop: 16 }} />
      </ScrollView>
    );
  
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
        style={{ flex: 1 }}
      >
        {Platform.OS === 'web' ? content : (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {content}
          </TouchableWithoutFeedback>
        )}
      </KeyboardAvoidingView>
    );
  };
  

  const renderSectionContent = () => {
    switch (section) {
      case 'details':
        return renderDetailsSection();
      case 'notes':
        return (
          <OrderNotesModal
            notesInput={notesInput}
            setNotesInput={setNotesInput}
            orderNotes={orderNotes}
            onAddNote={handleAddNote}
          />
        );
      case 'payment':
        return (
          <OrderPaymentModal
            selectedOrder={order}
            onStatusChange={onStatusChange}
            onPaymentStatusChange={onPaymentStatusChange}
            client = {client}

          />
        );
      case 'delete':
        return (
          <ConfirmDeleteModal
            onCancel={() => setSection('details')}
            onConfirm={onDeleteRequest}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modalWrapper}
      avoidKeyboard
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{order.jobTitle}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {(['details', 'notes', 'payment', 'delete'] as Section[]).map((tab) => (
            <TabButton
              key={tab}
              title={capitalize(tab)}
              active={section === tab}
              onPress={() => setSection(tab)}
            />
          ))}
        </View>

        {renderSectionContent()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '95%',
    minHeight: '60%',
    overflow: 'hidden',
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
  sectionContent: {
    padding: 20,
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    marginTop: 4,
  },
  buttonRow: {
    marginTop: 20,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  activeTabText: {
    color: '#1F2937',
    fontWeight: '600',
  },
});
