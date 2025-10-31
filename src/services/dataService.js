// Mock data service - in real app, this would make API calls
class DataService {
  constructor() {
    this.mockData = {
      vehicles: [
        {
          id: 1,
          make: 'Honda',
          model: 'Accord',
          year: 2020,
          color: 'Silver',
          mileage: '45,230',
          nextService: '2025-02-15',
          image: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
        },
        {
          id: 2,
          make: 'Toyota',
          model: 'Camry',
          year: 2018,
          color: 'Black',
          mileage: '67,890',
          nextService: '2025-01-28',
          image: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
        }
      ],
      appointments: [
        {
          id: 1,
          date: '2025-01-20',
          time: '10:00 AM',
          service: 'Oil Change & Inspection',
          vehicle: '2020 Honda Accord',
          technician: 'Mike Wilson',
          status: 'confirmed'
        },
        {
          id: 2,
          date: '2025-01-25',
          time: '2:00 PM',
          service: 'Brake Service',
          vehicle: '2018 Toyota Camry',
          technician: 'Sarah Johnson',
          status: 'pending'
        }
      ],
      workOrders: [
        {
          id: 'WO-001',
          customer: 'John Doe',
          vehicle: '2020 Honda Accord',
          service: 'Oil Change & Filter',
          priority: 'normal',
          estimatedTime: '45 min',
          status: 'in-progress'
        },
        {
          id: 'WO-002',
          customer: 'Sarah Smith',
          vehicle: '2018 Toyota Camry',
          service: 'Brake Inspection',
          priority: 'high',
          estimatedTime: '1.5 hours',
          status: 'scheduled'
        }
      ]
    };
  }

  async getVehicles(userId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.mockData.vehicles;
  }

  async getAppointments(userId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.mockData.appointments;
  }

  async getWorkOrders() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.mockData.workOrders;
  }

  async createAppointment(appointmentData) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newAppointment = {
      id: Date.now(),
      ...appointmentData,
      status: 'scheduled'
    };
    this.mockData.appointments.push(newAppointment);
    return newAppointment;
  }

  async updateAppointment(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.mockData.appointments.findIndex(apt => apt.id === id);
    if (index !== -1) {
      this.mockData.appointments[index] = { ...this.mockData.appointments[index], ...updates };
      return this.mockData.appointments[index];
    }
    throw new Error('Appointment not found');
  }
}

export default new DataService();