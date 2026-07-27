import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Typography, Chip,
  Button, Stack, Tabs, Tab,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

type Listing = {
  id: string;
  title: string;
  listingType: string;
  sellerRole: string;
  sellerId: string;
  price?: number | null;
  depositAmount?: number | null;
  status: string;
  city?: string | null;
  createdAt: string;
};

type Report = {
  id: string;
  listingId: string;
  reporterRole: string;
  reporterId: string;
  reason?: string | null;
  createdAt: string;
};

const TYPE_LABEL: Record<string, string> = { rent: 'Rent', sell: 'Sell', resale: 'Re-sell' };

export function MarketplacePage() {
  const [tab, setTab] = useState(0);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [l, r] = await Promise.all([
        adminApi.marketplaceListings() as Promise<Listing[]>,
        adminApi.marketplaceReports() as Promise<Report[]>,
      ]);
      setListings(l);
      setReports(r);
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

  const handleBan = async (id: string, banSeller: boolean) => {
    if (!window.confirm(banSeller ? 'Ban this listing AND the seller account?' : 'Ban this listing?')) return;
    setBusyId(id);
    try {
      await adminApi.banMarketplaceListing(id, banSeller);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ban failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this listing?')) return;
    setBusyId(id);
    try {
      await adminApi.deleteMarketplaceListing(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="P2P Marketplace"
        subtitle="Moderate rentals, classifieds, and leftover-material resale listings"
      />
      <ErrorAlert message={error} />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Listings (${listings.length})`} />
        <Tab label={`Reports (${reports.length})`} />
      </Tabs>

      {tab === 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.length === 0 && (
                <TableRow><TableCell colSpan={7}><Typography color="text.secondary">No listings yet</Typography></TableCell></TableRow>
              )}
              {listings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.title}</TableCell>
                  <TableCell><Chip size="small" label={TYPE_LABEL[l.listingType] || l.listingType} /></TableCell>
                  <TableCell>{l.sellerRole} · {l.sellerId}</TableCell>
                  <TableCell>{l.listingType === 'rent' ? `₹${l.depositAmount ?? 0} deposit` : `₹${l.price ?? 0}`}</TableCell>
                  <TableCell>{l.city || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={l.status}
                      color={l.status === 'active' ? 'success' : l.status === 'banned' ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      {l.status !== 'banned' ? (
                        <>
                          <Button size="small" color="warning" disabled={busyId === l.id} onClick={() => handleBan(l.id, false)}>
                            Ban listing
                          </Button>
                          <Button size="small" color="error" disabled={busyId === l.id} onClick={() => handleBan(l.id, true)}>
                            Ban seller
                          </Button>
                        </>
                      ) : null}
                      <Button size="small" color="error" disabled={busyId === l.id} onClick={() => handleDelete(l.id)}>
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Listing</TableCell>
                <TableCell>Reporter</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>When</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 && (
                <TableRow><TableCell colSpan={5}><Typography color="text.secondary">No reports</Typography></TableCell></TableRow>
              )}
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.listingId}</TableCell>
                  <TableCell>{r.reporterRole} · {r.reporterId}</TableCell>
                  <TableCell>{r.reason || '—'}</TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button size="small" color="error" disabled={busyId === r.listingId} onClick={() => handleBan(r.listingId, false)}>
                      Ban listing
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
