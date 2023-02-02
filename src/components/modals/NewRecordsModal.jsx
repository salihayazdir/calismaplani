import { Dialog, Transition } from '@headlessui/react';
import Loader from '../skeletons/Loader';
import { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';

export default function NewRecordsModal({
  isOpen,
  setIsOpen,
  newRecords,
  selectedDate,
  prevRecordsExist,
  sendingOnlyTheSelectedRecords,
  setSendingOnlyTheSelectedRecords,
  selectedUsernames,
}) {
  const [offPersonnelExists, setOffPersonnelExists] = useState(false);

  const [apiStatus, setApiStatus] = useState({
    isLoading: false,
    isSent: false,
    isError: false,
    message: '',
  });
  const { isLoading, isSent, isError, message } = apiStatus;

  const sendRecords = () => {
    setApiStatus({
      isLoading: true,
      isSent: false,
      isError: false,
      message: '',
    });

    let recordsToSend;

    if (sendingOnlyTheSelectedRecords === true) {
      recordsToSend = newRecords
        .map((dayOfRecords) => {
          const recordDate = format(
            addDays(selectedDate, dayOfRecords.dayIdx),
            'yyyy-MM-dd'
          );
          return dayOfRecords.data.map((record) => ({
            username: record.username,
            record_date: recordDate,
            user_status_id: record.user_status_id,
            record_status_id: record.record_status_id,
            mailData: {
              display_name: record.display_name,
              mail: record.mail,
            },
          }));
        })
        .flat()
        .filter(
          (record) =>
            record.user_status_id !== 0 &&
            selectedUsernames.indexOf(record.username) !== -1
        );
    } else {
      recordsToSend = newRecords
        .map((dayOfRecords) => {
          const recordDate = format(
            addDays(selectedDate, dayOfRecords.dayIdx),
            'yyyy-MM-dd'
          );
          return dayOfRecords.data.map((record) => ({
            username: record.username,
            record_date: recordDate,
            user_status_id: record.user_status_id,
            record_status_id: record.record_status_id,
            mailData: {
              display_name: record.display_name,
              mail: record.mail,
            },
          }));
        })
        .flat()
        .filter((record) => record.user_status_id !== 0);
    }

    const indexOfOffPersonnelRecord = recordsToSend.findIndex(
      (record) => record.user_status_id > 3
    );
    if (indexOfOffPersonnelRecord !== -1) setOffPersonnelExists(true);

    axios
      .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/records/add-record`, {
        records: recordsToSend,
        rawRecords: newRecords,
        recordsStartDate: format(selectedDate, 'd MMMM yyyy'),
        recordsEndDate: format(addDays(selectedDate, 4), 'd MMMM yyyy'),
        prevRecordsExist: Boolean(prevRecordsExist),
      })
      .then((res) => {
        // console.log(res);
        if (res.data.success === true) {
          setApiStatus({
            isLoading: false,
            isSent: true,
            isError: false,
            message: res.data.message || '',
          });
        } else {
          setApiStatus({
            isLoading: false,
            isError: true,
            isSent: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setApiStatus({
          isLoading: false,
          isSent: true,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  const handleClose = () => {
    setIsOpen(false);
    setSendingOnlyTheSelectedRecords(false);
    // setApiStatus({
    //   isLoading: false,
    //   isSent: false,
    //   isError: false,
    //   message: '',
    // });
    // setOffPersonnelExists(false);
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all'>
                  <div className='flex items-center justify-between border-b border-gray-200 pl-6 pr-3 '>
                    <Dialog.Title
                      as='h3'
                      className='py-3 text-lg font-bold text-gray-900'
                    >
                      Kayıtları Gönder
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className='rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    >
                      <XMarkIcon className='h-5 w-5' />
                    </button>
                  </div>

                  {isSent === false && (
                    <div className='px-6 pt-4'>
                      <div className='flex flex-col gap-1 rounded-md bg-gray-50 p-4 text-gray-800'>
                        <span className='font-medium text-blue-600'>{`${format(
                          selectedDate,
                          'dd-MM-yyyy'
                        )}  /  ${format(
                          addDays(selectedDate, 4),
                          'dd-MM-yyyy'
                        )} `}</span>
                        <div>
                          <span>tarih aralığında</span>
                          <span>
                            {sendingOnlyTheSelectedRecords === true
                              ? ` ${selectedUsernames.length} `
                              : ` tüm `}
                          </span>
                          <span>personel için kayıt girişi yapılacaktır.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className='flex flex-col gap-6 p-6'>
                    <div className='flex flex-col gap-6'>
                      {isLoading === true ? (
                        <div className='flex w-full justify-center text-center '>
                          <Loader />
                        </div>
                      ) : null}

                      {isLoading === false ? (
                        <>
                          {isSent === true ? (
                            <p
                              className={`rounded-lg border px-6 py-3 text-sm ${
                                isError
                                  ? 'border-red-200 bg-red-100 text-red-700'
                                  : 'border-green-200 bg-green-100 text-green-700'
                              }`}
                            >
                              {message
                                ? message
                                : isError
                                ? 'Bir hata meydana geldi.'
                                : 'Kayıtlar başarıyla gönderildi.'}
                            </p>
                          ) : null}

                          {isSent === true && offPersonnelExists === true ? (
                            <div className='flex flex-col gap-2 rounded-lg bg-gray-100 px-6 py-3 text-sm leading-[18px] text-gray-700'>
                              <h3 className='inline-flex items-center gap-2 text-base font-medium text-amber-600'>
                                <span>
                                  <ExclamationCircleIcon className='h-5 w-5' />
                                </span>
                                <span>Uyarı</span>
                              </h3>
                              <p>
                                Gönderilen kayıtlar arasında izinli personel
                                bulunuyor. Lütfen HR uygulaması üzerinden izin
                                kaydı girmeyi unutmayın.
                              </p>
                            </div>
                          ) : null}

                          {isSent === false && prevRecordsExist === true ? (
                            <div className='flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-100 px-6 py-3 text-sm leading-[18px] text-amber-700'>
                              <h3 className='inline-flex items-center gap-2 text-base font-medium'>
                                <span>
                                  <ExclamationCircleIcon className='h-5 w-5' />
                                </span>
                                <span>Uyarı</span>
                              </h3>
                              <p>
                                Seçilen tarihlerde mevcut kayıt bulunmaktadır.
                                Onaylamanız halinde kayıtlar değiştirilecektir.
                              </p>
                            </div>
                          ) : null}

                          {isSent === false ? (
                            <>
                              <button
                                onClick={sendRecords}
                                type='button'
                                className='inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
                              >
                                Onayla ve Gönder
                              </button>
                              <button
                                onClick={handleClose}
                                type='button'
                                className='-mt-4 -mb-2 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
                              >
                                İptal
                              </button>
                            </>
                          ) : (
                            <button
                              className='inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-3 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
                              type='button'
                              onClick={handleClose}
                            >
                              Tamam
                            </button>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
