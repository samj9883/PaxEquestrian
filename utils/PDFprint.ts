// utils/PDFprint.ts
import { Client, Order } from '../types';

export const generateInvoicePDF = (order: Order, client: Client) => {
  if (typeof window === 'undefined') return;

  const formatDate = (date?: Date | any) => {
    if (!date) return '';
    const parsedDate = date.toDate ? date.toDate() : new Date(date);
    return parsedDate.toLocaleDateString();
  };

  const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice - ${order.jobTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #000; }
          h1 { font-size: 24px; margin-bottom: 20px; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .label { font-weight: bold; }
          .value { margin-bottom: 6px; }
          hr { margin: 20px 0; }
          .footer { margin-top: 40px; font-style: italic; font-size: 12px; }
          @media print {
            body { zoom: 90%; }
          }
        </style>
      </head>
      <body>
        <h1>Invoice</h1>
        <div class="section">
          <div class="section-title">Client Info</div>
          <div class="value"><span class="label">Name:</span> ${client.name}</div>
          <div class="value"><span class="label">Email:</span> ${client.email ?? 'N/A'}</div>
          <div class="value"><span class="label">Phone:</span> ${client.phone ?? 'N/A'}</div>
          <div class="value"><span class="label">Address:</span> ${client.address ?? 'N/A'}</div>
        </div>
        <div class="section">
          <div class="section-title">Order Details</div>
          <div class="value"><span class="label">Job Title:</span> ${order.jobTitle}</div>
          <div class="value"><span class="label">Status:</span> ${order.status}</div>
          <div class="value"><span class="label">Payment Status:</span> ${order.paymentStatus}</div>
          <div class="value"><span class="label">Completed Date:</span> ${formatDate(order.dateCompleted)}</div>
          <div class="value"><span class="label">Deadline:</span> ${formatDate(order.deadline)}</div>
          <div class="value"><span class="label">Estimated Hours:</span> ${order.estimatedHours ?? 'N/A'}</div>
        </div>
        <hr />
        <div class="footer">
          Thank you for your business. You may print or share this invoice from your browser.
        </div>
      </body>
    </html>
  `;

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  }
};
