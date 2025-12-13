import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FreelancerNotes = ({ workspaceId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (workspaceId) {
      fetchNotes();
    }
  }, [workspaceId]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try API first
      try {
        const response = await axios.get(
          `${API_URL}/api/workspaces/${workspaceId}/freelancer/notes`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setNotes(response.data.notes || []);
          return;
        }
      } catch (apiError) {
        console.log('API notes endpoint not available, using localStorage');
      }
      
      // Fallback to localStorage
      const localStorageKey = `workspace_${workspaceId}_freelancer_notes`;
      const savedNotes = localStorage.getItem(localStorageKey);
      
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  const saveNotesToLocalStorage = (notesArray) => {
    const localStorageKey = `workspace_${workspaceId}_freelancer_notes`;
    localStorage.setItem(localStorageKey, JSON.stringify(notesArray));
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      alert('Please enter note content');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try API first
      try {
        const response = await axios.post(
          `${API_URL}/api/workspaces/${workspaceId}/freelancer/notes`,
          {
            content: newNote.trim(),
            workspaceId: workspaceId
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.data.success) {
          setNewNote('');
          fetchNotes();
          return;
        }
      } catch (apiError) {
        console.log('API add note endpoint not available, using localStorage');
      }
      
      // Fallback: Add to local state and localStorage
      const newNoteObj = {
        noteId: Date.now().toString(),
        content: newNote.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedNotes = [newNoteObj, ...notes];
      setNotes(updatedNotes);
      saveNotesToLocalStorage(updatedNotes);
      setNewNote('');
      
      alert('Note saved locally!');
      
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = async (noteId) => {
    if (!editContent.trim()) {
      alert('Note content cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try API first
      try {
        const response = await axios.put(
          `${API_URL}/api/workspaces/${workspaceId}/freelancer/notes/${noteId}`,
          {
            content: editContent.trim(),
            workspaceId: workspaceId
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.data.success) {
          setEditingNoteId(null);
          setEditContent('');
          fetchNotes();
          return;
        }
      } catch (apiError) {
        console.log('API edit note endpoint not available, using localStorage');
      }
      
      // Fallback: Update local state and localStorage
      const updatedNotes = notes.map(note => 
        note.noteId === noteId
          ? { 
              ...note, 
              content: editContent.trim(),
              updatedAt: new Date().toISOString()
            }
          : note
      );
      
      setNotes(updatedNotes);
      saveNotesToLocalStorage(updatedNotes);
      setEditingNoteId(null);
      setEditContent('');
      
      alert('Note updated locally!');
      
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try API first
      try {
        const response = await axios.delete(
          `${API_URL}/api/workspaces/${workspaceId}/freelancer/notes/${noteId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.data.success) {
          fetchNotes();
          return;
        }
      } catch (apiError) {
        console.log('API delete note endpoint not available, using localStorage');
      }
      
      // Fallback: Delete from local state and localStorage
      const updatedNotes = notes.filter(note => note.noteId !== noteId);
      setNotes(updatedNotes);
      saveNotesToLocalStorage(updatedNotes);
      
      alert('Note deleted locally!');
      
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="freelancer-notes-container">
      <div className="notes-header">
        <h2>Private Notes</h2>
        <p className="notes-description">
          Your private journal for this project. These notes are only visible to you.
          Use them to track thoughts, ideas, or private feedback.
        </p>
      </div>

      <div className="notes-search">
        <div className="search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="notes-count">
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="add-note-section">
        <div className="note-editor">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new private note..."
            rows="4"
            className="note-textarea"
            disabled={loading}
          />
          <div className="note-actions">
            <button
              onClick={handleAddNote}
              disabled={loading || !newNote.trim()}
              className="btn-primary"
            >
              {loading ? 'Saving...' : (
                <>
                  <Plus size={18} />
                  Add Note
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <div className="empty-notes">
            <AlertCircle size={48} />
            <h3>No private notes yet</h3>
            <p>Start by adding your first note above</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.noteId} className="note-card">
              {editingNoteId === note.noteId ? (
                <div className="note-edit-mode">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="4"
                    className="edit-textarea"
                    autoFocus
                    disabled={loading}
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => handleEditNote(note.noteId)}
                      disabled={loading || !editContent.trim()}
                      className="btn-primary"
                    >
                      {loading ? 'Saving...' : (
                        <>
                          <Save size={16} />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditContent('');
                      }}
                      className="btn-outline"
                      disabled={loading}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="note-content">
                    {note.content}
                  </div>
                  <div className="note-footer">
                    <span className="note-date">
                      {formatDate(note.createdAt)}
                      {note.updatedAt && note.updatedAt !== note.createdAt && (
                        <span className="updated-label"> (edited)</span>
                      )}
                    </span>
                    <div className="note-actions-icons">
                      <button
                        onClick={() => {
                          setEditingNoteId(note.noteId);
                          setEditContent(note.content);
                        }}
                        className="btn-icon"
                        title="Edit note"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.noteId)}
                        className="btn-icon delete"
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="notes-tips">
        <h4>Tips for using private notes:</h4>
        <ul>
          <li>📝 Track project insights and learnings</li>
          <li>💭 Record ideas for future improvements</li>
          <li>🔒 Store sensitive information privately</li>
          <li>🎯 Set personal goals and reminders</li>
          <li>📊 Monitor your progress and growth</li>
        </ul>
      </div>
    </div>
  );
};

export default FreelancerNotes;