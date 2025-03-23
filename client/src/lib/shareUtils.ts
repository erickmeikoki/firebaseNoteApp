import { Note } from '@/types';
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';

interface ShareOptions {
  expiresAfter?: number; // Time in milliseconds after which the share expires
  isPublic?: boolean; // Whether the shared note is accessible to anyone with the link
  allowEdit?: boolean; // Whether the shared note can be edited
}

export interface ShareInfo {
  shareId: string;
  createdAt: Date;
  expiresAt?: Date;
  isPublic: boolean;
  allowEdit: boolean;
  createdBy: string;
  shareUrl: string;
}

/**
 * Creates a share link for a note
 * @param note The note to share
 * @param userId The ID of the user sharing the note
 * @param options Options for sharing
 * @returns The share information
 */
export const shareNote = async (
  note: Note, 
  userId: string,
  options: ShareOptions = {}
): Promise<ShareInfo> => {
  try {
    // Generate a unique share ID
    const shareId = nanoid(10);
    
    // Determine expiration time if provided
    const now = new Date();
    let expiresAt: Date | undefined = undefined;
    
    if (options.expiresAfter) {
      expiresAt = new Date(now.getTime() + options.expiresAfter);
    }
    
    // Create the share object
    const shareData = {
      shareId,
      noteId: note.id,
      userId,
      title: note.title,
      content: note.content,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt ? expiresAt : null,
      isPublic: options.isPublic !== undefined ? options.isPublic : true,
      allowEdit: options.allowEdit !== undefined ? options.allowEdit : false,
      tags: note.tags || [],
      viewCount: 0,
    };
    
    // Create the share document in Firestore
    const shareRef = doc(db, 'shares', shareId);
    await setDoc(shareRef, shareData);
    
    // Update the note's shareIds array
    const noteRef = doc(db, 'notes', note.id);
    await updateDoc(noteRef, {
      shareIds: arrayUnion(shareId),
      lastSharedAt: serverTimestamp()
    });
    
    // Generate the share URL
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/shared/${shareId}`;
    
    // Return share information
    return {
      shareId,
      createdAt: now,
      expiresAt,
      isPublic: shareData.isPublic,
      allowEdit: shareData.allowEdit,
      createdBy: userId,
      shareUrl
    };
  } catch (error) {
    console.error('Error sharing note:', error);
    throw error;
  }
};

/**
 * Gets a shared note by its share ID
 * @param shareId The ID of the share
 * @returns The shared note
 */
export const getSharedNote = async (shareId: string): Promise<Note | null> => {
  try {
    const shareRef = doc(db, 'shares', shareId);
    const shareSnap = await getDoc(shareRef);
    
    if (!shareSnap.exists()) {
      return null;
    }
    
    const shareData = shareSnap.data();
    
    // Check if share has expired
    if (shareData.expiresAt && new Date(shareData.expiresAt.toDate()) < new Date()) {
      return null;
    }
    
    // Increment view count
    await updateDoc(shareRef, {
      viewCount: (shareData.viewCount || 0) + 1,
      lastViewedAt: serverTimestamp()
    });
    
    // Convert to Note type
    const sharedNote: Note = {
      id: shareData.noteId,
      title: shareData.title,
      content: shareData.content,
      createdAt: shareData.createdAt,
      updatedAt: shareData.createdAt, // Use createdAt as updatedAt for shared notes
      tags: shareData.tags || [],
      isFavorite: false,
      isArchived: false,
      isShared: true,
      shareInfo: {
        shareId,
        isPublic: shareData.isPublic,
        allowEdit: shareData.allowEdit,
        createdBy: shareData.userId,
        viewCount: shareData.viewCount
      }
    };
    
    // Add optional notebookId only if it exists in the share data
    if (shareData.notebookId) {
      sharedNote.notebookId = shareData.notebookId;
    }
    
    return sharedNote;
  } catch (error) {
    console.error('Error getting shared note:', error);
    throw error;
  }
};

/**
 * Deletes a shared note
 * @param shareId The ID of the share to delete
 * @param noteId The ID of the note
 * @param userId The ID of the user deleting the share
 */
export const deleteShare = async (shareId: string, noteId: string, userId: string): Promise<void> => {
  try {
    // First get the share to verify ownership
    const shareRef = doc(db, 'shares', shareId);
    const shareSnap = await getDoc(shareRef);
    
    if (!shareSnap.exists()) {
      throw new Error('Share not found');
    }
    
    const shareData = shareSnap.data();
    
    // Verify ownership
    if (shareData.userId !== userId) {
      throw new Error('Unauthorized to delete this share');
    }
    
    // Delete the share
    await setDoc(shareRef, { 
      deleted: true,
      deletedAt: serverTimestamp()
    }, { merge: true });
    
    // Update the note document
    const noteRef = doc(db, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);
    
    if (noteSnap.exists()) {
      const noteData = noteSnap.data();
      const updatedShareIds = (noteData.shareIds || []).filter((id: string) => id !== shareId);
      
      await updateDoc(noteRef, {
        shareIds: updatedShareIds
      });
    }
  } catch (error) {
    console.error('Error deleting share:', error);
    throw error;
  }
};