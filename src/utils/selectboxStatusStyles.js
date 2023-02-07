export default function selectboxStatusStyles(statusId) {
  switch (statusId) {
    case 0:
      return ' text-gray-400 font-light';
      break;
    case 1:
      return ' text-green-500 font-semibold';
      break;
    case 2:
      return ' text-blue-500 font-semibold';
      break;
    case 3:
      return ' text-yellow-500 font-semibold';
      break;
    default:
      return ' text-red-500 font-semibold';
  }
}
