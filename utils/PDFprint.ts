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
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Invoice - ${order.jobTitle}</title>
    <style>
      body {
        background-color: #000;
        color: #fff;
        font-family: 'Arial', sans-serif;
        padding: 60px;
        line-height: 1.6;
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
        font-size: 36px;
        margin: 0;
        font-weight: bold;
      }

      .header-left .date {
        color: #f7c948;
        margin-top: 6px;
        font-weight: bold;
      }

      .header-right img {
        height: 200px;
      }

      .address-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 40px;
        }

        .address {
        flex: 1;
        }

        .address:first-child {
        text-align: left;
        }

        .address:last-child {
        text-align: right;
        }


      .job-section {
        border-top: 1px solid #888;
        border-bottom: 1px solid #888;
        padding: 30px 0;
        margin-bottom: 30px;
      }

      .label {
        color: #f7c948;
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-size: 14px;
        margin-top: 20px;
      }

      .total-section {
        font-size: 16px;
        margin-top: 30px;
      }

      .total-section .label {
        font-weight: bold;
        color: #f7c948;
      }

      .footer {
        margin-top: 40px;
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
