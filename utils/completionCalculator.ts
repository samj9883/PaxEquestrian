import { EstimatedCompletion, Order, WorkPreferences } from '../types';

export const calculateEstimatedCompletions = (
  orders: Order[],
  workPreferences: WorkPreferences
): EstimatedCompletion[] => {
  const activeOrders = orders.filter(order => order.status !== 'complete');

  // Step 1: Sort by priority: inProgress > deadline urgency > waiting
  const sortedOrders = activeOrders.sort((a, b) => {
    const statusScore = (order: Order) => order.status === 'started' ? 0 : 1;

    const aScore = statusScore(a);
    const bScore = statusScore(b);

    if (aScore !== bScore) return aScore - bScore;

    if (a.deadline && b.deadline) {
      return a.deadline.getTime() - b.deadline.getTime();
    }
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;

    return a.dateReceived.getTime() - b.dateReceived.getTime();
  });

  const estimations: EstimatedCompletion[] = [];
  let currentDate = new Date();
  let carryOverHours = 0;

  const finalOrder: {
    order: Order;
    estimatedDate: Date;
    remainingHours: number;
    isUrgent: boolean;
  }[] = [];

  const postponed: {
    order: Order;
    estimatedDate: Date;
    remainingHours: number;
    isUrgent: boolean;
  }[] = [];

  for (const order of sortedOrders) {
    const remainingHours = Math.max(0, order.estimatedHours - order.hoursCompleted);
    const estimatedDate = calculateDateFromHours(
      currentDate,
      carryOverHours + remainingHours,
      workPreferences
    );

    const isUrgent = !!order.deadline && estimatedDate > order.deadline;

    const entry = { order, estimatedDate, remainingHours, isUrgent };

    if (isUrgent) {
      postponed.push(entry);
    } else {
      finalOrder.push(entry);
      carryOverHours += remainingHours;
      currentDate = new Date(estimatedDate);
    }
  }

  // Step 2: Sort postponed by how overdue they are (most urgent first)
  postponed.sort((a, b) => {
    if (!a.order.deadline || !b.order.deadline) return 0;
    return a.order.deadline.getTime() - b.order.deadline.getTime(); // soonest deadline first
  });

  finalOrder.push(...postponed);

  // Sort all entries: urgent first, then by estimated date
  finalOrder.sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return a.estimatedDate.getTime() - b.estimatedDate.getTime();
  });


  // Step 3: Flatten into EstimatedCompletion[]
  return finalOrder.map(({ order, estimatedDate, remainingHours, isUrgent }) => ({
    orderId: order.id,
    estimatedDate,
    remainingHours,
    isUrgent,
  }));
};


export const calculateDateFromHours = (
  startDate: Date,
  totalHours: number,
  workPreferences: WorkPreferences
): Date => {
  let workingDate = new Date(startDate);
  workingDate.setHours(0, 0, 0, 0); // Normalize
  let remainingHours = totalHours;

  while (remainingHours > 0) {
    if (isWorkingDay(workingDate, workPreferences)) {
      const hoursToday = Math.min(remainingHours, workPreferences.hoursPerDay);
      remainingHours -= hoursToday;
    }

    if (remainingHours > 0) {
      workingDate.setDate(workingDate.getDate() + 1);
    }
  }

  return workingDate;
};

export const isWorkingDay = (date: Date, workPreferences: WorkPreferences): boolean => {
  const dayOfWeek = date.getDay();

  // Check for regular days off (e.g., weekends)
  if (workPreferences.daysOff.includes(dayOfWeek)) {
    return false;
  }

  // Check for custom days off
  return !workPreferences.customDaysOff.some(customDate => {
    const a = new Date(customDate);
    const b = new Date(date);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return a.getTime() === b.getTime();
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
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
