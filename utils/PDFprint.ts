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
    'https://firebasestorage.googleapis.com/v0/b/paxequestrian-e455d.firebasestorage.app/o/Group%2018.png?alt=media&token=570bca31-ec66-4b67-a130-d31a5797e595';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="format-detection" content="telephone=no">
      <title>Invoice - ${order.jobTitle}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          background-color: #fff;
          color: #000;
          font-family: 'Inter', sans-serif;
          padding: 60px;
          line-height: 1.7;
          font-size: 18px;
        }
  
        a[href^="tel"] {
          color: inherit;
          text-decoration: none;
          pointer-events: none;
          cursor: default;
        }
  
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 60px;
        }
  
        .header-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        
  
        .header-left h1 {
          font-size: 36px;
          font-weight: 300;
          letter-spacing: 1px;
          margin: 0;
        }
  
        .header-left .date {
          margin-top: 6px;
          color: #D4AF37;
          font-weight: 300;
          font-size: 16px;
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

        .address strong.client-name {
            color: #000;
            font-weight: 600;
            font-size: 19px;
            }

  
        .address:first-child {
          text-align: left;
        }
  
        .address:last-child {
          text-align: right;
        }
  
        .address strong {
          color: #D4AF37;
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
          color: #D4AF37;
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
          color: #D4AF37;
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
          <div><strong class="client-name">${client.name}</strong></div>
          <div>${client.address ? client.address.replace(/, */g, ',<br/>') : 'Address not provided'}</div>
          <div>${client.phone ?? 'Phone not provided'}</div>
        </div>
        <div class="address">
          <div><strong>Office Address</strong></div>
          <div>Pax Cottage</div>
          <div>Woonton</div>
          <div>Herefordshire</div>
          <div>HR3 6QH</div>
          <div>07970 684703</div>
          <div>paxequestrian@hotmail.com</div>

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
          Payable By BACS To:<br />
          <strong>Helen M Jones </strong><br />
          40-24-11<br />
          72266415<br />
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
