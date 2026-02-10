
import { GoogleGenAI } from "@google/genai";
import { Order, User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  status: 'SENT' | 'FAILED';
}

/**
 * Generates a notification for the ADMIN when a delivery partner accepts an order.
 */
export const generateAdminOrderAcceptedNotification = async (order: Order, driver: User): Promise<string> => {
  try {
    const prompt = `You are an automated logistics monitor for the 'Georgios' marketplace.
    Generate a concise internal notification for the Platform Admin.
    
    EVENT: Order Accepted by Driver
    Order ID: ${order.id}
    Farmer: ${order.farmerName} (${order.farmerVillage})
    Consumer: ${order.consumerName} (${order.address})
    Delivery Partner: ${driver.name} (Vehicle: ${driver.vehicle?.type} - ${driver.vehicle?.number})
    Distance: ${order.distanceKm}km
    Delivery Fee: ₹${order.deliveryCost}

    Instructions:
    - Inform the admin that logistics are now in motion.
    - Provide the driver's contact placeholder.
    - Output ONLY the body content.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    return `Logistics Update: Order #${order.id.slice(-4)} has been claimed by ${driver.name}. Transit from ${order.farmerVillage} to ${order.address} is starting.`;
  }
};

/**
 * Generates a professional notification for the FARMER as requested.
 */
export const generateFarmerNotification = async (order: Order): Promise<string> => {
  try {
    const itemsList = order.items.map(i => `${i.name} (${i.quantity}kg)`).join(', ');
    
    const prompt = `You are an AI assistant for a farmer-to-consumer ordering system.
    Generate an order notification email for the farmer.
    
    Order Details:
    Customer Name: ${order.consumerName}
    Customer Email: ${order.consumerId} (using ID as placeholder)
    Delivery Address: ${order.address}
    
    Product Name: ${itemsList}
    Quantity: Mixed items totaling ${order.items.reduce((a, b) => a + b.quantity, 0)}kg
    Total Price: ₹${order.totalAmount}

    Instructions:
    - Generate a clear and professional email message for the farmer
    - Use simple and easy-to-understand language
    - Present order details in a neat, readable format
    - Do not add or assume any information that is not provided
    - Do not include explanations or extra text
    - Output ONLY the email body content (no subject, no markdown)
    - TONE: Friendly, professional, and straightforward.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Farmer Email Generation Error:", error);
    return `New Order Received!\n\nCustomer: ${order.consumerName}\nAddress: ${order.address}\nTotal: ₹${order.totalAmount}\n\nPlease check your Georgios dashboard for details.`;
  }
};

export const generateOrderEmail = async (order: Order, user: User): Promise<{ subject: string; body: string }> => {
  try {
    const prompt = `Act as the Georgios Marketplace automated email system. 
    Draft a professional, friendly order confirmation email for the CUSTOMER:
    User: ${user.name}
    Order ID: ${order.id}
    Total Amount: ₹${order.totalAmount + order.deliveryCost}

    Return result strictly as JSON string with "subject" and "body" fields.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      subject: result.subject || `Order Confirmed: #${order.id.slice(-6)}`,
      body: result.body || "Your order has been placed successfully."
    };
  } catch (error) {
    return {
      subject: `Order Confirmed: #${order.id.slice(-6)}`,
      body: "Your order has been placed successfully. Support: chethu77h@gmaill.com"
    };
  }
};

export const simulateSendEmail = async (order: Order, recipientEmail: string, isFarmer: boolean = false): Promise<EmailLog> => {
  let body = "";
  let subject = "";

  if (isFarmer) {
    body = await generateFarmerNotification(order);
    subject = `New Order Signal: #${order.id.slice(-4)}`;
  } else {
    // Customer email
    const content = await generateOrderEmail(order, { name: order.consumerName, email: recipientEmail } as User);
    body = content.body;
    subject = content.subject;
  }
  
  const log: EmailLog = {
    id: `email_${Date.now()}`,
    to: recipientEmail,
    subject: subject,
    body: body,
    timestamp: new Date().toISOString(),
    status: 'SENT'
  };

  const existingLogs = JSON.parse(localStorage.getItem('georgios_email_logs') || '[]');
  localStorage.setItem('georgios_email_logs', JSON.stringify([log, ...existingLogs]));

  return log;
};

export const simulateSendAdminEmail = async (order: Order, driver: User): Promise<EmailLog> => {
  const body = await generateAdminOrderAcceptedNotification(order, driver);
  const subject = `Logistics Alert: Order #${order.id.slice(-4)} Accepted`;
  
  const log: EmailLog = {
    id: `admin_email_${Date.now()}`,
    to: 'admin@georgios.market',
    subject: subject,
    body: body,
    timestamp: new Date().toISOString(),
    status: 'SENT'
  };

  const existingLogs = JSON.parse(localStorage.getItem('georgios_email_logs') || '[]');
  localStorage.setItem('georgios_email_logs', JSON.stringify([log, ...existingLogs]));

  return log;
};

export const openInEmailClient = (log: EmailLog) => {
  const mailtoUrl = `mailto:${log.to}?subject=${encodeURIComponent(log.subject)}&body=${encodeURIComponent(log.body)}`;
  window.location.href = mailtoUrl;
};
