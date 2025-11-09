import React from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import DashboardLayout from '../components/DashboardLayout';
import { Shield, Users, Calendar, ClipboardList, Tag, Clock } from 'lucide-react';

const SupervisorDashboardContent = () => {
  const jobCardList = useSelector((state) => state.jobCardList || {});
  const { jobCards = [] } = jobCardList;

  const totalCompleted = (jobCards || []).filter(j => String(j.J_JobCardStatus).toLowerCase() === 'completed').length;
  const totalInProgress = (jobCards || []).filter(j => String(j.J_JobCardStatus).toLowerCase() === 'in progress').length;

  const today = dayjs();
  const isSameDay = (d) => {
    if (!d) return false;
    return dayjs(d).isSame(today, 'day');
  };

  // helper to deduplicate job cards by booking id while preserving order
  const uniqueByBooking = (arr) => {
    const seen = new Set();
    const out = [];
    for (const it of (arr || [])) {
      const key = String(it?.J_BookingID ?? it?.BookingID ?? '');
      if (!key) {
        // include items without booking id
        out.push(it);
        continue;
      }
      if (!seen.has(key)) {
        seen.add(key);
        out.push(it);
      }
    }
    return out;
  };

  const todayInProgress = (jobCards || []).filter(j => String(j.J_JobCardStatus).toLowerCase() === 'in progress' && isSameDay(j.J_CreatedDate));
  const todayDone = (jobCards || []).filter(j => String(j.J_JobCardStatus).toLowerCase() === 'completed' && isSameDay(j.J_CreatedDate));

  // Deduplicate by booking so each booking appears only once on the dashboard
  const todayInProgressUnique = uniqueByBooking(todayInProgress);
  const todayDoneUnique = uniqueByBooking(todayDone);

  return (
    <div className="h-full p-4 md:p-6">
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-400 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Total Completed Jobs</div>
                <div className="text-3xl font-bold mt-2">{totalCompleted}</div>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-gradient-to-br from-emerald-500 to-emerald-300 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Total In Progress</div>
                <div className="text-3xl font-bold mt-2">{totalInProgress}</div>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm text-gray-500">Today</div>
            <div className="mt-2 flex items-baseline gap-4">
              <div className="text-lg font-semibold">In Progress: <span className="text-indigo-600 font-bold ml-2">{todayInProgress.length}</span></div>
              <div className="text-lg font-semibold">Done: <span className="text-green-600 font-bold ml-2">{todayDone.length}</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Today's In Progress</h3>
            {todayInProgressUnique.length === 0 ? (
              <div className="text-sm text-gray-500">No in-progress job cards for today.</div>
            ) : (
              <ul className="space-y-3">
                {todayInProgressUnique.map(j => (
                  <li key={j.J_JobCardID} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:shadow-sm">
                    <div>
                      <div className="font-medium">JC-{String(j.J_JobCardID).padStart(4,'0')} — Booking {j.J_BookingID}</div>
                      <div className="text-sm text-gray-500">{j.J_Technician || 'Unassigned'}</div>
                    </div>
                    <div className="text-sm text-blue-600 font-semibold">In Progress</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Completed</h3>
            {todayDoneUnique.length === 0 ? (
              <div className="text-sm text-gray-500">No completed job cards for today.</div>
            ) : (
              <ul className="space-y-3">
                {todayDoneUnique.map(j => (
                  <li key={j.J_JobCardID} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:shadow-sm">
                    <div>
                      <div className="font-medium">JC-{String(j.J_JobCardID).padStart(4,'0')} — Booking {j.J_BookingID}</div>
                      <div className="text-sm text-gray-500">{j.J_Technician || 'Unassigned'}</div>
                    </div>
                    <div className="text-sm text-green-600 font-semibold">Completed</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SupervisorDashboard = () => {
  return (
   
      <SupervisorDashboardContent />
    
  );
};

export default SupervisorDashboard;
