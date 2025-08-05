import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
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

import { Order } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { OrderNotesModal } from './OrderNotesModal';
import { OrderStatusModal } from './OrderStatusModal';

type Section = 'details' | 'notes' | 'status' | 'delete';

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedOrder: Order | null;
  editedClientName: string;
  setEditedClientName: (value: string) => void;
  editedJobTitle: string;
  setEditedJobTitle: (value: string) => void;
  editedDescription: string;
  setEditedDescription: (value: string) => void;
  editedDeadline: string;
  setEditedDeadline: (value: string) => void;
  editedEstimatedHours: string;
  setEditedEstimatedHours: (value: string) => void;
  onSave: () => void;
  onAddNote: () => void;
  notesInput: string;
  setNotesInput: (text: string) => void;
  orderNotes: string[];
  hoursToAdd: string;
  setHoursToAdd: (text: string) => void;
  onAddHours: () => void;
  onStatusChange: (status: Order['status']) => void;
  onDeleteRequest: () => void;
  editedCost: string;
  setEditedCost: (value: string) => void;
  editedClientPrice: string;
  setEditedClientPrice: (value: string) => void;

};

export const OrderDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  selectedOrder,
  editedJobTitle,
  setEditedJobTitle,
  editedDescription,
  setEditedDescription,
  editedDeadline,
  setEditedDeadline,
  editedEstimatedHours,
  setEditedEstimatedHours,
  editedCost,
  setEditedCost,
  editedClientPrice,
  setEditedClientPrice,
  onSave,
  onAddNote,
  notesInput,
  setNotesInput,
  orderNotes,
  hoursToAdd,
  setHoursToAdd,
  onAddHours,
  onStatusChange,
  onDeleteRequest,
}) => {

  const [section, setSection] = useState<Section>('details');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
  if (selectedOrder) {
    setEditedDescription(selectedOrder.description || '');
    setEditedEstimatedHours(
      selectedOrder.estimatedHours != null
        ? selectedOrder.estimatedHours.toString()
        : ''
    );
    setEditedCost(
      selectedOrder.internalCost != null
        ? selectedOrder.internalCost.toString()
        : ''
    );
    setEditedClientPrice(
      selectedOrder.clientPrice != null
        ? selectedOrder.clientPrice.toString()
        : ''
    );
  }
}, [selectedOrder]);


  const renderDetailsSection = () => {
    const content = (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionContent}>
        <Input
          label="Job Title"
          value={editedJobTitle}
          onChangeText={setEditedJobTitle}
        />

          
          <Input
            label="Job Description"
            value={editedDescription}
            onChangeText={setEditedDescription}
            multiline
            numberOfLines={3}
          />

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Deadline</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={
                  editedDeadline
                    ? new Date(editedDeadline).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue) {
                    setEditedDeadline(new Date(dateValue).toISOString());
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
                    {editedDeadline
                      ? new Date(editedDeadline).toLocaleDateString()
                      : 'Select deadline date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    mode="date"
                    display="default"
                    value={editedDeadline ? new Date(editedDeadline) : new Date()}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setEditedDeadline(selectedDate.toISOString());
                      }
                    }}
                  />
                )}
              </>
            )}
          </View>

          <Input
            label="Estimated Hours"
            value={editedEstimatedHours}
            onChangeText={setEditedEstimatedHours}
            keyboardType="numeric"
          />

          <Input
            label="Cost (£)"
            value={editedCost}
            onChangeText={setEditedCost}
            keyboardType="numeric"
          />

          <Input
            label="Client Price (£)"
            value={editedClientPrice}
            onChangeText={setEditedClientPrice}
            keyboardType="numeric"
          />

          <Button title="Save Order Details" onPress={onSave} style={{ marginTop: 16 }} />
        </View>
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
            onAddNote={onAddNote}
          />
        );
      case 'status':
        return (
          <OrderStatusModal
            selectedOrder={selectedOrder}
            hoursToAdd={hoursToAdd}
            setHoursToAdd={setHoursToAdd}
            onAddHours={onAddHours}
            onStatusChange={onStatusChange}
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
          <Text style={styles.modalTitle}>
            {selectedOrder?.clientName} | {selectedOrder?.jobTitle}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {(['details', 'notes', 'status', 'delete'] as Section[]).map((tab) => (
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

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

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
    minHeight: '80%',
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
  sectionContent: {
    padding: 20,
    flexGrow: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 8,
    fontFamily: Platform.OS === 'web' ? 'Space Mono, monospace' : undefined,
  },
});