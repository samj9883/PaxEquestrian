import { EstimatedCompletion, Order, WorkPreferences } from '../types';

export const calculateEstimatedCompletions = (
  orders: Order[],
  workPreferences: WorkPreferences
): EstimatedCompletion[] => {
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

  const estimations: EstimatedCompletion[] = [];
  let currentDate = new Date();
  let accumulatedHours = 0;

  for (const order of activeOrders) {
    const remainingHours = Math.max(0, order.estimatedHours - order.hoursCompleted);
    accumulatedHours += remainingHours;

    const estimatedDate = calculateDateFromHours(
      currentDate,
      accumulatedHours,
      workPreferences
    );

    estimations.push({
      orderId: order.id,
      estimatedDate,
      remainingHours,
    });
  }

  return estimations;
};

export const calculateDateFromHours = (
  startDate: Date,
  totalHours: number,
  workPreferences: WorkPreferences
): Date => {
  let workingDate = new Date(startDate);
  let remainingHours = totalHours;

  while (remainingHours > 0) {
    // Check if current day is a working day
    if (isWorkingDay(workingDate, workPreferences)) {
      const hoursForToday = Math.min(remainingHours, workPreferences.hoursPerDay);
      remainingHours -= hoursForToday;
    }

    if (remainingHours > 0) {
      workingDate.setDate(workingDate.getDate() + 1);
    }
  }

  return workingDate;
};

export const isWorkingDay = (date: Date, workPreferences: WorkPreferences): boolean => {
  const dayOfWeek = date.getDay();
  
  // Check if it's a regular day off
  if (workPreferences.daysOff.includes(dayOfWeek)) {
    return false;
  }

  // Check if it's a custom day off
  const customDayOff = workPreferences.customDaysOff.some(customDate => 
    customDate.toDateString() === date.toDateString()
  );

  return !customDayOff;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `LW${year}${month}${day}-${random}`;
};