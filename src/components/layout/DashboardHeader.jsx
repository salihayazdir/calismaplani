import axios from 'axios';
import DateRangeRadio from '../DateRangeRadio';
import DashboardMenu from '../DashboardMenu';

export default function DashboardHeader() {
  return (
    <div className='flex items-center justify-between gap-6 bg-slate-700 px-10 py-3 text-white'>
      <h1 className='w-full text-xl font-bold text-white'>
        Personel Devam Raporu
      </h1>
      {/* <DashboardMenu /> */}
      {/* <button className='whitespace-nowrap rounded-lg px-4 py-1 text-sm text-slate-400 hover:bg-slate-600 hover:text-slate-200'>
        Personel Bilgilerini Güncellle
      </button> */}
    </div>
  );
}

{
  /* <button
  onClick={updateUserData}
  disabled
  className='whitespace-nowrap rounded-lg border border-gray-50 bg-orange-600 px-4 py-1 text-sm font-semibold text-white hover:bg-orange-500'
>
  Kullanıcıları Güncelle
</button>; */
}

// const updateUserData = () => {
//   console.log('update');
//     setupdateUserDataStatus({
//       isLoading: true,
//       isError: false,
//       message: '',
//     });
//     setModalIsOpen(true);

//     axios
//       .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/users/update`)
//       .then((res) => {
//         if (res.data.success === true) {
//           setRecords(res.data.records);
//           setupdateUserDataStatus({
//             isLoading: false,
//             isError: false,
//             message: res.data.message || '',
//           });
//         } else {
//           setupdateUserDataStatus({
//             isLoading: false,
//             isError: true,
//             message: res.data.message || 'Bağlantı hatası.',
//           });
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         setupdateUserDataStatus({
//           isLoading: false,
//           isError: true,
//           message: 'Bağlantı hatası.',
//         });
//       });
// };
