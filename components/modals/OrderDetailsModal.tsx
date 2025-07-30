import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
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
};

export const OrderDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  selectedOrder,
  editedClientName,
  editedJobTitle,
  editedDeadline,
  setEditedDeadline,
  editedEstimatedHours,
  setEditedEstimatedHours,
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
  const [editMode, setEditMode] = useState(false);

  const renderSectionContent = () => {
    switch (section) {
      case 'details':
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.sectionContent}>
                {/* Read-only fields */}
                <View style={styles.readOnlyBlock}>
                  <Text style={styles.label}>Client Name</Text>
                  <Text style={styles.readOnlyText}>{editedClientName}</Text>
                </View>
                <View style={styles.readOnlyBlock}>
                  <Text style={styles.label}>Job Title</Text>
                  <Text style={styles.readOnlyText}>{editedJobTitle}</Text>
                </View>
                {selectedOrder?.description && (
                  <View style={styles.readOnlyBlock}>
                    <Text style={styles.label}>Job Description</Text>
                    <Text style={styles.readOnlyText}>{selectedOrder.description}</Text>
                  </View>
                )}
      
                {/* Editable fields (always visible) */}
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
      
                <Button title="Save Order Details" onPress={onSave} style={{ marginTop: 16 }} />
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        );

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
      avoidKeyboard={true}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedOrder?.clientName} | {selectedOrder?.jobTitle}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
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

        {/* Section Body */}
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
  readOnlyBlock: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editToggle: {
    marginTop: 16,
    alignSelf: 'center',
  },
  editToggleText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
});
