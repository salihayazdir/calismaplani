export default function getChartStatusColors(statusId) {
  switch (statusId) {
    case 1:
      return '#22c55e';
      break;
    case 2:
      return '#3b82f6';
      break;
    case 3:
      return '#facc15';
      break;
    case 4:
      return '#d8b4fe';
      break;
    case 5:
      return '#9333ea';
      break;
    case 6:
      return '#fdba74';
      break;
    case 7:
      return '#ea580c';
      break;
    case 8:
      return '#f9a8d4';
      break;
    case 9:
      return '#db2777';
      break;
    case 10:
      return '#ef4444';
      break;
    case 11:
      return '#ef4444';
      break;
    case 12:
      return '#78350f';
      break;
    default:
      return '#9ca3af';
  }
}

export const chartStatusColors = [
  // ofiste
  '#22c55e',
  // evde
  '#3b82f6',
  // sahada
  '#facc15',
  // yıllık izin
  '#d8b4fe',
  // raporlu
  '#9333ea',
  // ücretsiz izin
  '#fdba74',
  // off
  '#ea580c',
  // mazeret izni
  '#f9a8d4',
  // doğum izni
  '#db2777',
  // covid
  '#ef4444',
  // karantina
  '#ef4444',
  // mesai izni
  '#78350f',
];
