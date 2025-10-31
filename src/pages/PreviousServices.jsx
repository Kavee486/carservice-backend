import React, { useEffect, useState } from 'react';
import { authService } from '../services/authServices';
import { previousService } from '../services/previousService';

const formatDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString(); } catch (e) { return d; }
};

const money = (v) => `Rs.${Number(v || 0).toLocaleString()}`;

const PreviousServices = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ PS_ServiceName: '', PS_PlaceName: '', PS_Price: '', PS_ServiceDate: '', PS_Notes: '' });

  const user = authService.getCurrentUser();
  const customerId = authService.getCustomerId();

  const load = async () => {
    try {
      setLoading(true);
      if (!customerId) {
        setItems([]);
        return;
      }
      const res = await previousService.getPreviousServicesByCustomerID(customerId);
      const list = res?.ResultSet || res?.Result || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load previous services', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) { alert('Customer ID missing - please login'); return; }
    if (!form.PS_ServiceName || !form.PS_Price) { alert('Enter service name and price'); return; }

    const payload = {
      PS_CustomerID: String(customerId),
      PS_ServiceName: form.PS_ServiceName,
      PS_PlaceName: form.PS_PlaceName,
      PS_Price: Number(form.PS_Price),
      PS_ServiceDate: form.PS_ServiceDate || new Date().toISOString().slice(0,10),
      PS_Notes: form.PS_Notes || ''
    };

    try {
      setSubmitting(true);
      const res = await previousService.addPreviousService(payload);
      if (res && (res.StatusCode === 200 || res.StatusCode === '200')) {
        // refresh list
        await load();
        setForm({ PS_ServiceName: '', PS_PlaceName: '', PS_Price: '', PS_ServiceDate: '', PS_Notes: '' });
        // subtle success UI
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
      } else {
        alert('Failed to add previous service: ' + (res?.Result || res?.Message || 'Unknown'));
      }
    } catch (err) {
      console.error('Add previous service failed', err);
      alert('Add failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full p-4 md:p-6">
      <div className="w-full space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-2xl p-6 mb-6 shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Previous Services</h1>
          <div className="text-sm opacity-90 mt-1">Record services you've had before so bookings are faster.</div>
          {user && (
            <div className="mt-3 text-sm bg-white/10 inline-block rounded px-3 py-1">
              <strong className="mr-2">{user.userName || user.UserName || user.name}</strong>
              <span className="opacity-90">{user.Email || user.email || ''}</span>
            </div>
          )}
        </div>
        <div>
          <button onClick={load} className="bg-white text-blue-600 px-4 py-2 rounded shadow-sm hover:shadow">Refresh</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-5 border">
            <h3 className="font-semibold mb-3">Add Previous Service</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Service name</label>
                <input placeholder="" value={form.PS_ServiceName} onChange={e=>setForm({...form, PS_ServiceName: e.target.value})} className="w-full border rounded-md px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Place / Workshop</label>
                <input placeholder="" value={form.PS_PlaceName} onChange={e=>setForm({...form, PS_PlaceName: e.target.value})} className="w-full border rounded-md px-3 py-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price (LKR)</label>
                  <input placeholder="" value={form.PS_Price} type="number" onChange={e=>setForm({...form, PS_Price: e.target.value})} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Service date</label>
                  <input type="date" value={form.PS_ServiceDate} onChange={e=>setForm({...form, PS_ServiceDate: e.target.value})} className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Notes (optional)</label>
                <textarea placeholder="Notes about the service" value={form.PS_Notes} onChange={e=>setForm({...form, PS_Notes: e.target.value})} className="w-full border rounded-md px-3 py-2 h-24" />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setForm({ PS_ServiceName: '', PS_PlaceName: '', PS_Price: '', PS_ServiceDate: '', PS_Notes: '' })} className="px-4 py-2 border rounded">Clear</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded shadow">
                  {submitting ? 'Adding...' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-5 border">
            <h3 className="font-semibold mb-4">Your previous services</h3>

            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 opacity-70" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M6 11h12M10 15h4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="text-lg">No previous services yet</div>
                <div className="mt-2">Add a previous service using the form on the left to speed up bookings.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(it => (
                  <div key={it.PS_ID || it.PS_ServiceID || it.id || Math.random()} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">S</div>
                        <div>
                          <div className="font-medium text-lg">{it.PS_ServiceName}</div>
                          <div className="text-sm text-gray-500 mt-1">{it.PS_PlaceName} • {formatDate(it.PS_ServiceDate)}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="font-semibold text-lg">{money(it.PS_Price)}</div>
                        {it.PS_Notes && <div className="mt-2 text-sm text-gray-600">{it.PS_Notes}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PreviousServices;
