// src/components/PatientPopup.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';

interface PatientPopupProps {
  patient: {
    name: string;
    age: number;
    gender: string;
  };
  onClose: () => void;
}

const PatientPopup: React.FC<PatientPopupProps> = ({ patient, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState('');
  const [noteStatus, setNoteStatus] = useState<'notSaved' | 'saved'>('notSaved'); // Track note status

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote(event.target.value);
  };

  const handleSaveNote = async () => {
    // Here we would extract the note and prepare it for saving
    console.log(`Extracted note for ${patient.name}: ${note}`);

    // Simulate an API call to save the note
    try {
      // Replace this with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating a delay
      console.log(`Saved note for ${patient.name}: ${note}`);
      setNoteStatus('saved'); // Update status to saved
      setIsEditing(false); // Exit editing mode after saving
    } catch (error) {
      console.error('Error saving the note:', error);
      // Handle error state as needed
    }
  };
  const confirmNote = async () => {

    // Simulate an API call to save the note
    try {
      // Replace this with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating a delay
      console.log(`Saved note for ${patient.name}: ${note}`);
      setNoteStatus('saved'); // Update status to saved
      setIsEditing(false); // Exit editing mode after saving
    } catch (error) {
      console.error('Error saving the note:', error);
      // Handle error state as needed

    }
    onClose();
  };
  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth className='animate-fade-in'>
      <DialogTitle>Patient Details</DialogTitle>
      <DialogContent>
        <Typography variant="h6">{patient.name}</Typography>
        <Typography>Age: {patient.age}</Typography>
        <Typography>Gender: {patient.gender}</Typography>

        {isEditing ? (
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            value={note}
            onChange={handleNoteChange}
          />
        ) : (
          <Typography>No notes yet.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        {isEditing ? (
          <>
            <Button onClick={handleSaveNote} color="primary">
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)} color="secondary">
              Cancel
            </Button>
          </>
        ) : (
          <>
            {noteStatus === 'saved' ? (
              <Button onClick={confirmNote} color="primary">
                Save Note
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} color="primary">
                Note this appointment
              </Button>
            )}
            <Button onClick={onClose} color="secondary">
              Close
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PatientPopup;
