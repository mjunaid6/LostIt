export type Item = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  university: string;
  type: 'lost' | 'found';
  status: 'lost' | 'found' | 'reunited';
  contact: string;
  imageUrl: string;
  reportedBy: string; // user email
  createdAt: Date;
};

export type User = {
  uid: string;
  name: string;
  email: string;
  university: string;
  avatar: string;
};
