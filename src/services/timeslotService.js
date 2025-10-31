import axios from 'axios';

const BASE = axios.defaults.baseURL || '';

export const timeslotService = {
  async getAllTimeslots() {
    const res = await axios.get(`${BASE}/Timeslot/GetAllTimeslots`);
    return res.data;
  },

  async addTimeslot(payload) {
    // payload should follow the backend shape, e.g. { T_Date, T_StartTime, T_EndTime, T_MaxCustomers }
    const res = await axios.post(`${BASE}/Timeslot/AddTimeslot`, payload);
    return res.data;
  }
  ,
  async deleteTimeslot(timeslotId) {
    // Backend expects { T_TimeslotID: id } as payload
    const res = await axios.post(`${BASE}/Timeslot/DeleteTimeslot`, { T_TimeslotID: timeslotId });
    return res.data;
  },

  filterActiveTimeslots(allTimeslots) {
    return allTimeslots.filter(slot => slot.T_Status === "A");
  },

  filterActiveTodaysTimeslots(allTimeslots) {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    return allTimeslots.filter(slot => {
      const d = new Date(slot.T_Date);
      return (
        slot.T_Status === "A" &&
        d.getFullYear() === todayYear &&
        d.getMonth() === todayMonth &&
        d.getDate() === todayDate
      );
    });
  }
};
