import { Client, Order } from '../types';

export const generateInvoicePDF = (order: Order, client: Client) => {
  if (typeof window === 'undefined') return;

  const formatDate = (date?: Date | any) => {
    if (!date) return '';
    const parsedDate = date.toDate ? date.toDate() : new Date(date);
    return parsedDate.toLocaleDateString();
  };

  const today = new Date().toLocaleDateString();

  const logoUrl =
    'https://firebasestorage.googleapis.com/v0/b/paxequestrian-e455d.firebasestorage.app/o/Group%209.png?alt=media&token=941bd402-fde4-41ca-9f4e-9c538cb62dd5';

  const htmlContent = `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice - ${order.jobTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #ffffff;
          background: #000000;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header img {
          max-height: 60px;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 1px solid #888;
          padding-bottom: 4px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-column {
          width: 48%;
        }
        .company-details {
          margin-bottom: 40px;
        }
        .footer {
          margin-top: 60px;
          font-style: italic;
          font-size: 12px;
          text-align: center;
        }
        @media print {
          body { zoom: 90%; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoUrl}" alt="Company Logo" />
        <h1>Invoice</h1>
        <div>Invoice Date: ${today}</div>
      </div>

      <div class="company-details">
        <div class="section-title">Your Business Info</div>
        <div><strong>Business Name:</strong> Group9 Digital</div>
        <div><strong>Email:</strong> info@group9digital.co.uk</div>
        <div><strong>Phone:</strong> +44 1234 567890</div>
        <div><strong>Bank:</strong> Barclays UK</div>
        <div><strong>Account Number:</strong> 12345678</div>
        <div><strong>Sort Code:</strong> 12-34-56</div>
        <div><strong>IBAN:</strong> GB00BARC12345612345678</div>
      </div>

      <div class="info-row">
        <div class="info-column">
          <div class="section-title">Client Info</div>
          <div><strong>Name:</strong> ${client.name}</div>
          <div><strong>Email:</strong> ${client.email ?? 'N/A'}</div>
          <div><strong>Phone:</strong> ${client.phone ?? 'N/A'}</div>
          <div><strong>Address:</strong> ${client.address ?? 'N/A'}</div>
        </div>
        <div class="info-column">
          <div class="section-title">Order Info</div>
          <div><strong>Job Title:</strong> ${order.jobTitle}</div>
          <div><strong>Description:</strong> ${order.description}</div>
          <div><strong>Status:</strong> ${order.status}</div>
          <div><strong>Payment Status:</strong> ${order.paymentStatus}</div>
          <div><strong>Completed:</strong> ${formatDate(order.dateCompleted)}</div>
          <div><strong>Deadline:</strong> ${formatDate(order.deadline)}</div>
          <div><strong>Est. Hours:</strong> ${order.estimatedHours ?? 'N/A'}</div>
        </div>
      </div>

      <div class="footer">
        Thank you for your business. Please print or save this invoice for your records.
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
