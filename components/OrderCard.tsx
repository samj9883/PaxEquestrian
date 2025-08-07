import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Order } from '../types';
import { formatCurrency, formatDate } from '../utils/completionCalculator';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  showEstimatedCompletion?: boolean;
  estimatedDate?: Date;
  isUrgent?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  showEstimatedCompletion = false,
  estimatedDate,
  isUrgent = false,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const statusColorMap: Record<Order['status'], string> = {
    waiting: '#F59E0B',
    started: '#3B82F6',
    complete: '#10B981',
    deleted: '#6B7280',
  };

  const statusTextMap: Record<Order['status'], string> = {
    waiting: 'Waiting',
    started: 'In Progress',
    complete: 'Complete',
    deleted: 'Deleted',
  };

  const progressPercentage = (order.hoursCompleted / order.estimatedHours) * 100;
  const remainingHours = Math.max(0, order.estimatedHours - order.hoursCompleted);

  return (
    <TouchableOpacity
      style={[styles.card, isUrgent && styles.urgentCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.clientName}>
          {order.clientName} | {order.jobTitle}
        </Text>
      </View>

      {isUrgent && (
        <Text style={styles.urgentBadge}>⚠️ Urgent: Deadline-priority</Text>
      )}

      <Text style={styles.orderNumber}>{order.orderNumber}</Text>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: statusColorMap[order.status],
            alignSelf: isMobile ? 'flex-start' : 'auto',
            position: isMobile ? 'relative' : 'absolute',
            top: isMobile ? undefined : 16,
            right: isMobile ? undefined : 16,
            marginBottom: isMobile ? 8 : 0,
          },
        ]}
      >
        <Text style={styles.statusText}>{statusTextMap[order.status]}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {order.description}
      </Text>

      <View style={styles.dateRow}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Received</Text>
          <Text style={styles.dateValue}>{formatDate(order.dateReceived)}</Text>
        </View>
        {order.deadline && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Deadline</Text>
            <Text
              style={[
                styles.dateValue,
                order.deadline < new Date() && order.status !== 'complete' && styles.overdue,
              ]}
            >
              {formatDate(order.deadline)}
            </Text>
          </View>
        )}
      </View>

      {showEstimatedCompletion && estimatedDate && (
        <View style={styles.estimationContainer}>
          <Text style={styles.estimationLabel}>Est. Completion</Text>
          <Text style={styles.estimationValue}>{formatDate(estimatedDate)}</Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {order.hoursCompleted}h / {order.estimatedHours}h completed
          </Text>
          <Text style={styles.remainingText}>{remainingHours}h remaining</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${Math.min(progressPercentage, 100)}%` }]}
          />
        </View>
      </View>

      <View style={styles.priceRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Cost</Text>
          <Text style={styles.priceValue}>{formatCurrency(order.internalCost)}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={[styles.priceValue, styles.clientPrice]}>
            {formatCurrency(order.clientPrice)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  urgentCard: {
    borderColor: '#DC2626',
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  urgentBadge: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  overdue: {
    color: '#DC2626',
    fontWeight: '600',
  },
  estimationContainer: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  estimationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  estimationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
  },
  remainingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  clientPrice: {
    color: '#059669',
  },
});
