export interface User {
  uid: string;
  phone: string;
  name: string;
  balance: number;
  pin?: string;
  createdAt: Date;
  fcmToken?: string;
}

export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  senderPhone: string;
  receiverPhone: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'sent' | 'received';
  note?: string;
  createdAt: Date;
}

export interface PaymentRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromPhone: string;
  toId: string;
  toName: string;
  toPhone: string;
  amount: number;
  note?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type:
    | 'payment_received'
    | 'payment_sent'
    | 'request_received'
    | 'request_accepted'
    | 'request_rejected';
  data?: Record<string, string>;
  read: boolean;
  createdAt: Date;
}
