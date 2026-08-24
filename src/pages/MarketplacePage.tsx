import { useEffect, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Typography, Chip,
  Button, Stack, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

type Listing = {
  id: string;
  title: string;
  listingType: string;
  categoryId: string;
  description?: string | null;
  photos?: string[];
  sellerRole: string;
  sellerId: string;
  sellerName?: string | null;
  sellerPhone?: string | null;
  price?: number | null;
  depositAmount?: number | null;
  rentPricePerDay?: number | null;
  status: string;
  moderationStatus: string | null;
  rejectionReason?: string | null;
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

function priceLabel(l: Listing) {
  if (l.listingType === 'rent') return `₹${l.depositAmount ?? 0} deposit`;
  return `₹${l.price ?? 0}`;
}

export function MarketplacePage() {
  const [tab, setTab] = useState(0);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [reviewing, setReviewing] = useState<Listing | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

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

  const pending = useMemo(() => listings.filter((l) => l.moderationStatus === 'pending'), [listings]);
  const approved = useMemo(
    () => listings.filter((l) => l.moderationStatus !== 'pending' && l.moderationStatus !== 'rejected' && l.status === 'active'),
    [listings],
  );
  const rejectedOrRemoved = useMemo(
    () => listings.filter((l) => l.moderationStatus === 'rejected' || l.status === 'banned' || l.status === 'removed'),
    [listings],
  );

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await adminApi.approveMarketplaceListing(id);
      setReviewing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    try {
      await adminApi.rejectMarketplaceListing(id, rejectReason.trim() || undefined);
      setReviewing(null);
      setRejecting(false);
      setRejectReason('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleBan = async (id: string, banSeller: boolean) => {
    if (!window.confirm(banSeller ? 'Ban this listing AND the seller account?' : 'Ban this listing?')) return;
    setBusyId(id);
    try {
      await adminApi.banMarketplaceListing(id, banSeller);
      setReviewing(null);
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
      setReviewing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const openReview = (l: Listing) => {
    setRejecting(false);
    setRejectReason('');
    setReviewing(l);
  };

  if (loading) return <LoadingState />;

  const renderListingsTable = (rows: Listing[], emptyLabel: string, reviewable: boolean) => (
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
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={7}><Typography color="text.secondary">{emptyLabel}</Typography></TableCell></TableRow>
          )}
          {rows.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.title}</TableCell>
              <TableCell><Chip size="small" label={TYPE_LABEL[l.listingType] || l.listingType} /></TableCell>
              <TableCell>{l.sellerName || `${l.sellerRole} · ${l.sellerId}`}</TableCell>
              <TableCell>{priceLabel(l)}</TableCell>
              <TableCell>{l.city || '—'}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={l.moderationStatus === 'pending' ? 'pending' : l.status}
                  color={
                    l.moderationStatus === 'pending'
                      ? 'warning'
                      : l.status === 'active' && l.moderationStatus !== 'rejected'
                        ? 'success'
                        : l.status === 'banned' || l.moderationStatus === 'rejected'
                          ? 'error'
                          : 'default'
                  }
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                  {reviewable ? (
                    <Button size="small" variant="outlined" onClick={() => openReview(l)}>
                      Review
                    </Button>
                  ) : (
                    <>
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
                    </>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <PageHeader
        title="P2P Marketplace / EXO Store"
        subtitle="Review and moderate rentals, classifieds, and leftover-material resale listings"
      />
      <ErrorAlert message={error} />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Pending Approvals (${pending.length})`} />
        <Tab label={`Live / Approved (${approved.length})`} />
        <Tab label={`Rejected / Removed (${rejectedOrRemoved.length})`} />
        <Tab label={`All Listings (${listings.length})`} />
        <Tab label={`Reports (${reports.length})`} />
      </Tabs>

      {tab === 0 && renderListingsTable(pending, 'No ads waiting for review', true)}
      {tab === 1 && renderListingsTable(approved, 'No live ads', false)}
      {tab === 2 && renderListingsTable(rejectedOrRemoved, 'No rejected or removed ads', false)}
      {tab === 3 && renderListingsTable(listings, 'No listings yet', false)}
      {tab === 4 && (
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

      <Dialog open={!!reviewing} onClose={() => setReviewing(null)} maxWidth="sm" fullWidth>
        {reviewing && (
          <>
            <DialogTitle>{reviewing.title}</DialogTitle>
            <DialogContent>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Seller</Typography>
                  <Typography>{reviewing.sellerName || '—'} · {reviewing.sellerPhone || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Category / Type</Typography>
                  <Typography>{reviewing.categoryId} · {TYPE_LABEL[reviewing.listingType] || reviewing.listingType}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Price</Typography>
                  <Typography>{priceLabel(reviewing)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{reviewing.description || '—'}</Typography>
                </Box>
                {!!reviewing.photos?.length && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Photos</Typography>
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {reviewing.photos.map((src, i) => (
                        <Box
                          key={i}
                          component="img"
                          src={src}
                          alt={`photo-${i}`}
                          sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {rejecting && (
                  <TextField
                    label="Rejection reason (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    multiline
                    minRows={2}
                    fullWidth
                  />
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
              <Button color="error" disabled={busyId === reviewing.id} onClick={() => handleDelete(reviewing.id)}>
                Delete
              </Button>
              <Stack direction="row" spacing={1}>
                {rejecting ? (
                  <>
                    <Button onClick={() => setRejecting(false)}>Cancel</Button>
                    <Button variant="contained" color="error" disabled={busyId === reviewing.id} onClick={() => handleReject(reviewing.id)}>
                      Confirm Reject
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outlined" color="error" disabled={busyId === reviewing.id} onClick={() => setRejecting(true)}>
                      Reject
                    </Button>
                    <Button variant="contained" color="success" disabled={busyId === reviewing.id} onClick={() => handleApprove(reviewing.id)}>
                      Approve
                    </Button>
                  </>
                )}
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
