import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ShareInfo {
  shareId: string;
  isPublic: boolean;
  allowEdit: boolean;
  createdBy: string;
  viewCount?: number;
  expiresAt?: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags: Tag[];
  isFavorite: boolean;
  isArchived: boolean;
  notebookId?: string;
  shareIds?: string[];
  lastSharedAt?: Timestamp;
  isShared?: boolean;
  shareInfo?: ShareInfo;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}
