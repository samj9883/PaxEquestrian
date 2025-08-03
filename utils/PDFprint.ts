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
    'https://firebasestorage.googleapis.com/v0/b/paxequestrian-e455d.firebasestorage.app/o/Group%2016.png?alt=media&token=3f9b9101-6daf-4616-9929-5a9bd14aad31';

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Invoice - ${order.jobTitle}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        background-color: #fff;
        color: #000;
        font-family: 'Inter', sans-serif;
        padding: 60px;
        line-height: 1.7;
        font-size: 18px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 60px;
      }

      .header-left {
        flex: 1;
      }

      .header-left h1 {
        font-size: 44px;
        margin: 0;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .header-left .date {
        color: #f7c948;
        margin-top: 10px;
        font-weight: 600;
        font-size: 18px;
      }

      .header-right img {
        height: 180px;
      }

      .address-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 50px;
      }

      .address {
        flex: 1;
        font-size: 18px;
        line-height: 1.6;
      }

      .address:first-child {
        text-align: left;
      }

      .address:last-child {
        text-align: right;
      }

      .address strong {
        color: #f7c948;
        font-weight: 600;
        font-size: 19px;
      }

      .job-section {
        border-top: 2px solid #ccc;
        border-bottom: 2px solid #ccc;
        padding: 40px 0;
        margin-bottom: 40px;
      }

      .label {
        color: #f7c948;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-size: 17px;
        margin-top: 24px;
        margin-bottom: 6px;
      }

      .total-section {
        font-size: 18px;
        margin-top: 40px;
      }

      .total-section .label {
        font-weight: 600;
        color: #f7c948;
        font-size: 18px;
      }

      .footer {
        margin-top: 30px;
        font-size: 17px;
        line-height: 1.5;
      }

      @media print {
        body { zoom: 90%; }
      }
    </style>
  </head>
  <body>

    <div class="header">
      <div class="header-left">
        <h1>INVOICE</h1>
        <div class="date">${today}</div>
      </div>
      <div class="header-right">
        <img src="${logoUrl}" alt="Pax Equestrian Logo" />
      </div>
    </div>

    <div class="address-row">
      <div class="address">
        <div><strong>To:</strong></div>
        <div>${client.name}</div>
        <div>${client.address ?? 'Address not provided'}</div>
        <div>${client.phone ?? 'Phone not provided'}</div>
      </div>
      <div class="address">
        <div><strong>Office Address</strong></div>
        <div>Pax Cottage</div>
        <div>Herefordshire</div>
        <div>HR3 6QH</div>
        <div>07970 684703</div>
      </div>
    </div>

    <div class="job-section">
      <div class="label">Job Title</div>
      <div>${order.jobTitle}</div>

      <div class="label">Job Description</div>
      <div>${order.description}</div>
    </div>

    <div class="total-section">
      <div class="label">Total Cost: £${order.clientPrice}</div>
      <div class="footer">
        Payable To:<br />
        Helen Jones<br />
        payment details .....
      </div>
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
