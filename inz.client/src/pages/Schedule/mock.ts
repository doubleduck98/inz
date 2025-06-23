import { WeekSchedule } from './types/Schedule';

export const mock = {
  bookings: [
    {
      id: 1,
      hour: 8,
      date: '2025-06-19',
      roomNameName: 'Pokuj 1',
      patient: 'Marcin Krasucki',
    },
    {
      id: 2,
      hour: 9,
      date: '2025-06-19',
      roomNameName: 'Pokuj 1',
      patient: 'Marcin Krasucki',
    },
    {
      id: 3,
      hour: 10,
      date: '2025-06-19',
      roomNameName: 'Pokuj 1',
      patient: 'Marcin Krasucki',
    },
    {
      id: 5,
      hour: 11,
      date: '2025-06-19',
      roomNameName: 'Pokuj 1',
      patient: 'Marcin Krasucki',
    },
  ],
};

export const mockWeek: WeekSchedule = {
  days: [
    {
      bookings: [
        {
          hour: 9,
          patient: 'Szymon Zienkiewicz',
          roomName: 'Bardzo długa nazwa sali xd',
        },
        { hour: 15, patient: 'Bartosz Błaszczyk', roomName: 'Sala 1' },
      ],
    },
    {
      bookings: [{ hour: 11, patient: 'Szymon Zienkiewicz', roomName: 'Sala 2' }],
    },
    {
      bookings: [],
    },
    {
      bookings: [
        { hour: 14, patient: 'Marcin Krasucki', roomName: 'Sala 1' },
        { hour: 15, patient: 'Daniel Zwierzyński', roomName: 'Sala 2' },
        { hour: 16, patient: 'Szymon Zienkiewicz', roomName: 'Sala 3' },
      ],
    },
    {
      bookings: [{ hour: 9, patient: 'Marcin Krasucki', roomName: 'Sala 2' }],
    },
  ],
};
