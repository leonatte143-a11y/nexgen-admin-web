import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Stack,
  Box,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { Can } from '../components/Can';
import { PERMISSIONS, normalizeRole } from '../config/rbac';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const ROLE_OPTIONS = [
  { value: 'manager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'marketing', label: 'Marketing Team' },
  { value: 'client_support', label: 'Client Support' },
  { value: 'recruitment_exec', label: 'Recruitment Executive' },
];

interface StaffRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  lastLogin: string | null;
  designation: string;
}

export function StaffPage() {
  const adminRole = useSelector((s: RootState) => s.auth.admin?.role);
  const isAdmin = normalizeRole(adminRole) === 'admin';
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'manager',
    designation: '',
    baseSalary: '',
    upiId: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      setRows((await adminApi.listStaff()) as StaffRow[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveStaff = async () => {
    try {
      const res = await adminApi.createStaff({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
        designation: form.designation || undefined,
        baseSalary: form.baseSalary ? Number(form.baseSalary) : undefined,
        upiId: form.upiId || undefined,
      }) as { tempPassword?: string };
      setTempPassword(res.tempPassword || null);
      setOpen(false);
      setForm({ name: '', email: '', phone: '', role: 'manager', designation: '', baseSalary: '', upiId: '' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    }
  };

  const toggleStatus = async (row: StaffRow) => {
    try {
      await adminApi.updateStaff(row.id, { isActive: row.status !== 'Active' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Staff Directory"
        subtitle="Onboard staff, assign roles, and manage access"
        action={
          isAdmin ? (
            <Button
              variant="contained"
              onClick={() => setOpen(true)}
              sx={{
                bgcolor: '#1A237E',
                borderRadius: '12px',
                fontWeight: 700,
                '&:hover': { bgcolor: '#0D1642' },
              }}
            >
              + Onboard New Staff
            </Button>
          ) : null
        }
      />
      <ErrorAlert message={error} />
      {tempPassword && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setTempPassword(null)}>
          Staff created. Temporary password: <strong>{tempPassword}</strong> — share securely and require password change on first login.
        </Alert>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Staff Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Login</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>
                <Chip label={r.role} size="small" />
              </TableCell>
              <TableCell>{r.email}</TableCell>
              <TableCell>
                <Chip
                  label={r.status}
                  size="small"
                  color={r.status === 'Active' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>{r.lastLogin ? new Date(r.lastLogin).toLocaleString() : '—'}</TableCell>
              <TableCell align="right">
                <Can permission={PERMISSIONS.STAFF_MANAGE}>
                  <Button size="small" onClick={() => toggleStatus(r)}>
                    {r.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </Can>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Onboard New Staff</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth required />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth required />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
            <TextField select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} fullWidth>
              {ROLE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Base Salary (₹)" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} fullWidth />
              <TextField label="UPI ID" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} fullWidth />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveStaff}>Save Staff</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
