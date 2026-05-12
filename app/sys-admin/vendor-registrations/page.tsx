'use client';

import { useEffect, useState } from 'react';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import { Eye, X, Store, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/app/components/loader';

interface VendorRegistration {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessDescription?: string;
  amount: number;
  paymentMethod: string;
  receiptUrl?: string;
  zelleReference?: string;
  paymentStatus: 'pending' | 'confirmed' | 'rejected';
  ticketCode?: string;
  confirmedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  event?: { id: string; title: string; slug?: string; startDate: string };
}

const STATUS_PILL: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function VendorRegistrationsPage() {
  const [registrations, setRegistrations] = useState<VendorRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'rejected' | 'all'>('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [details, setDetails] = useState<VendorRegistration | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [page, status]);

  const fetchAll = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(status !== 'all' && { status }),
    });
    const { data, error } = await callApi<ApiResponse<VendorRegistration[]>>(
      `/admin/vendor-registrations?${params.toString()}`,
      'GET'
    );
    if (!error && data) {
      setRegistrations(Array.isArray(data.data) ? data.data : []);
      const meta: any = (data as any).meta || {};
      setTotalPages(meta.totalPages || 1);
      setTotal(meta.total || 0);
    } else if (error) {
      toast.error(error.message || 'Failed to load vendor registrations');
    }
    setLoading(false);
  };

  const approve = async (reg: VendorRegistration) => {
    if (!confirm(`Confirm Zelle payment received for ${reg.businessName} ($${reg.amount})?`)) return;
    setActioning(reg.id);
    const { error } = await callApi<ApiResponse<any>>(
      `/admin/vendor-registrations/${reg.id}/approve`,
      'POST'
    );
    setActioning(null);
    if (error) return toast.error(error.message || 'Failed to approve');
    toast.success('Vendor confirmed — email sent');
    setDetails(null);
    fetchAll();
  };

  const reject = async (reg: VendorRegistration) => {
    const reason = prompt('Reason for rejection (sent to the vendor in the email):', 'We could not verify a Zelle deposit matching your submission.');
    if (reason === null) return;
    setActioning(reg.id);
    const { error } = await callApi<ApiResponse<any>>(
      `/admin/vendor-registrations/${reg.id}/reject`,
      'POST',
      { reason }
    );
    setActioning(null);
    if (error) return toast.error(error.message || 'Failed to reject');
    toast.success('Vendor rejected — email sent');
    setDetails(null);
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6" /> Vendor Registrations
          </h1>
          <p className="text-sm text-gray-500 mt-1">Verify Zelle payments and confirm vendor spots.</p>
        </div>
        <div className="text-sm text-gray-600">{total} total</div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'confirmed', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${status === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader /></div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          No {status === 'all' ? '' : status} vendor registrations.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.businessName}</td>
                    <td className="px-4 py-3">
                      <div>{r.firstName} {r.lastName}</div>
                      <div className="text-xs text-gray-500">{r.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.event?.title || r.eventId}</td>
                    <td className="px-4 py-3 font-medium">${r.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_PILL[r.paymentStatus]}`}>
                        {r.paymentStatus === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                        {r.paymentStatus === 'confirmed' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        {r.paymentStatus === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDetails(r)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 hover:bg-gray-50"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
              <div className="text-gray-500">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50">Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details modal */}
      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{details.businessName}</h2>
              <button onClick={() => setDetails(null)} className="p-1.5 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-xs uppercase text-gray-500 mb-1">Vendor</div><div>{details.firstName} {details.lastName}</div></div>
                <div><div className="text-xs uppercase text-gray-500 mb-1">Status</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_PILL[details.paymentStatus]}`}>{details.paymentStatus}</span>
                </div>
                <div><div className="text-xs uppercase text-gray-500 mb-1">Email</div><div className="break-all">{details.email}</div></div>
                <div><div className="text-xs uppercase text-gray-500 mb-1">Phone</div><div>{details.phone}</div></div>
                <div><div className="text-xs uppercase text-gray-500 mb-1">Amount</div><div className="font-semibold">${details.amount} via {details.paymentMethod}</div></div>
                <div><div className="text-xs uppercase text-gray-500 mb-1">Event</div><div>{details.event?.title}</div></div>
                {details.zelleReference && (
                  <div className="col-span-2"><div className="text-xs uppercase text-gray-500 mb-1">Zelle reference</div><div>{details.zelleReference}</div></div>
                )}
                {details.businessDescription && (
                  <div className="col-span-2"><div className="text-xs uppercase text-gray-500 mb-1">Business description</div><div>{details.businessDescription}</div></div>
                )}
                {details.ticketCode && (
                  <div className="col-span-2"><div className="text-xs uppercase text-gray-500 mb-1">Ticket code</div><div className="font-mono font-bold text-emerald-700">{details.ticketCode}</div></div>
                )}
                {details.rejectionReason && (
                  <div className="col-span-2"><div className="text-xs uppercase text-gray-500 mb-1">Rejection reason</div><div className="text-red-700">{details.rejectionReason}</div></div>
                )}
              </div>

              {details.receiptUrl && (
                <div>
                  <div className="text-xs uppercase text-gray-500 mb-2">Uploaded receipt</div>
                  {/\.pdf($|\?)/i.test(details.receiptUrl) ? (
                    <a href={details.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">Open PDF receipt →</a>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={details.receiptUrl} alt="Receipt" className="w-full max-h-[400px] object-contain rounded border border-gray-200 bg-gray-50" />
                  )}
                </div>
              )}

              {details.paymentStatus === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => approve(details)}
                    disabled={actioning === details.id}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Confirm Zelle Payment
                  </button>
                  <button
                    onClick={() => reject(details)}
                    disabled={actioning === details.id}
                    className="flex-1 px-4 py-2.5 bg-white text-red-700 font-semibold rounded-lg border border-red-300 hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
