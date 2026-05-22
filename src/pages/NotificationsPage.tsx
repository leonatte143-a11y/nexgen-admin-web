import { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, MenuItem } from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { ErrorAlert } from '../components/ErrorAlert';

export function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('offer');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    try {
      const res = await adminApi.broadcast({ title, body, city: city || undefined, type });
      setMsg(`Sent to ${(res as { sent: number }).sent} users`);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    }
  };

  return (
    <>
      <PageHeader title="Notification Management" />
      <ErrorAlert message={error} />
      {msg && <Typography color="success.main" sx={{ mb: 2 }}>{msg}</Typography>}
      <Card>
        <CardContent>
          <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" />
          <TextField fullWidth multiline rows={3} label="Message" value={body} onChange={(e) => setBody(e.target.value)} margin="normal" />
          <TextField fullWidth label="City (optional)" value={city} onChange={(e) => setCity(e.target.value)} margin="normal" />
          <TextField select fullWidth label="Type" value={type} onChange={(e) => setType(e.target.value)} margin="normal">
            <MenuItem value="offer">Offer</MenuItem>
            <MenuItem value="alert">Alert</MenuItem>
            <MenuItem value="partner">Partner</MenuItem>
          </TextField>
          <Button variant="contained" onClick={send} sx={{ mt: 2 }}>Broadcast</Button>
        </CardContent>
      </Card>
    </>
  );
}
