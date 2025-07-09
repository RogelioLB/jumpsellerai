export interface User {
  id: string;
  email: string;
  image?: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  chatId: string;
  createdAt: Date;
}
