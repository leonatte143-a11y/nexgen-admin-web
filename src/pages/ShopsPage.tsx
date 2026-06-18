import { useCallback, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  Typography,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { useMountedFetch } from '../hooks/useMountedFetch';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { hasPermission, PERMISSIONS } from '../config/rbac';

interface ShopRow {
  id: string;
  shopName: string;
  ownerName?: string;
  categoryName?: string;
  city?: string;
  phone?: string;
  verificationStatus: string;
  isFeatured?: boolean;
  callCount?: number;
  directionsCount?: number;
  clickCount?: number;
  referralCount?: number;
}

interface LeadStats {
  totals: { calls: number; directions: number; referrals: number; clicks: number };
  shops: ShopRow[];
}

interface ShopCategory {
  id: string;
  name: string;
  isActive?: boolean;
}

export function ShopsPage() {
  const role = useSelector((s: RootState) => s.auth.admin?.role);
  const canManage = hasPermission(role, PERMISSIONS.SHOPS_MANAGE);
  const [tab, setTab] = useState(0);
  const [newCatName, setNewCatName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(() => adminApi.pendingShops() as Promise<ShopRow[]>, []);
  const fetchAll = useCallback(() => adminApi.listShops() as Promise<ShopRow[]>, []);
  const fetchLeads = useCallback(() => adminApi.shopLeadStats() as Promise<LeadStats>, []);
  const fetchCats = useCallback(() => adminApi.shopCategories() as Promise<ShopCategory[]>, []);

  const pending = useMountedFetch(fetchPending, [fetchPending]);
  const allShops = useMountedFetch(fetchAll, [fetchAll]);
  const leads = useMountedFetch(fetchLeads, [fetchLeads]);
  const cats = useMountedFetch(fetchCats, [fetchCats]);

  const reloadAll = async () => {
    await Promise.all([pending.reload(), allShops.reload(), leads.reload()]);
  };

  const approve = async (id: string) => {
    try {
      await adminApi.approveShop(id);
      await reloadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    }
  };

  const reject = async (id: string) => {
    try {
      await adminApi.rejectShop(id);
      await reloadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed');
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    if (!canManage) return;
    try {
      await adminApi.setShopFeatured(id, featured);
      await allShops.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await adminApi.createShopCategory({ name: newCatName.trim() });
      setNewCatName('');
      await cats.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create category failed');
    }
  };

  if (pending.loading && tab === 0) return <LoadingState />;

  return (
    <>
      <PageHeader title="Shop & Marketplace" subtitle="Verify vendors, track leads, manage categories" />
      <ErrorAlert message={error || pending.error || allShops.error} />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Verification" />
        <Tab label="All shops" />
        <Tab label="Lead tracker" />
        <Tab label="Categories" />
      </Tabs>

      {tab === 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Shop</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>City</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(pending.data ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.shopName}</TableCell>
                <TableCell>{row.ownerName}</TableCell>
                <TableCell>{row.categoryName}</TableCell>
                <TableCell>{row.city}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => approve(row.id)}>Approve</Button>
                  <Button size="small" color="error" onClick={() => reject(row.id)}>Reject</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === 1 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Shop</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Leads</TableCell>
              {canManage ? <TableCell align="right">Actions</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {(allShops.data ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.shopName}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.verificationStatus} color={row.verificationStatus === 'verified' ? 'success' : 'default'} />
                </TableCell>
                <TableCell>{row.isFeatured ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {row.callCount ?? 0} calls · {row.directionsCount ?? 0} directions
                </TableCell>
                {canManage ? (
                  <TableCell align="right">
                    {row.verificationStatus === 'verified' ? (
                      <Button size="small" onClick={() => toggleFeatured(row.id, !row.isFeatured)}>
                        {row.isFeatured ? 'Unfeature' : 'Feature'}
                      </Button>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === 2 && leads.data && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Total clicks: {leads.data.totals.clicks} · Calls: {leads.data.totals.calls} · Directions:{' '}
            {leads.data.totals.directions} · Referrals: {leads.data.totals.referrals}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Shop</TableCell>
                <TableCell>Calls</TableCell>
                <TableCell>Directions</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Referrals</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.data.shops.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.shopName}</TableCell>
                  <TableCell>{s.callCount ?? 0}</TableCell>
                  <TableCell>{s.directionsCount ?? 0}</TableCell>
                  <TableCell>{s.clickCount ?? 0}</TableCell>
                  <TableCell>{s.referralCount ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {tab === 3 && (
        <Box>
          {canManage ? (
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField size="small" label="New category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
              <Button variant="contained" onClick={addCategory}>Add category</Button>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>View only — contact admin to add shop types.</Typography>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(cats.data ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.isActive ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  );
}
