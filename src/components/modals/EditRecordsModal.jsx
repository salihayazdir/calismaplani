import { Dialog, Transition } from '@headlessui/react';
import Loader from '../skeletons/Loader';
import { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';
import ModalStatusSelect from '../selecbox/ModalStatusSelect';
import _ from 'lodash';

export default function EditRecordsModal({
  isOpen,
  setIsOpen,
  userDataForEditRecordsModal,
  userStatuses,
  selectedDate,
  records,
  fetchTableData,
  newRecords,
  prevRecordsExist,
  sendingOnlyTheSelectedRecords,
  setSendingOnlyTheSelectedRecords,
  selectedUsernames,
}) {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

  const [newEditedRecords, setNewEditedRecords] = useState(() => {
    if (records.length !== 5) {
      return [
        {
          dayIdx: 0,
          user_status_id: 0,
        },
        {
          dayIdx: 1,
          user_status_id: 0,
        },
        {
          dayIdx: 2,
          user_status_id: 0,
        },
        {
          dayIdx: 3,
          user_status_id: 0,
        },
        {
          dayIdx: 4,
          user_status_id: 0,
        },
      ];
    } else {
      return records
        .sort(function compare(a, b) {
          var dateA = new Date(a.record_date);
          var dateB = new Date(b.record_date);
          return dateA - dateB;
        })
        .map((record, idx) => {
          return {
            dayIdx: idx,
            user_status_id: record.user_status_id,
          };
        });
    }
  });

  const [apiStatus, setApiStatus] = useState({
    isLoading: false,
    isSent: false,
    isError: false,
    message: '',
  });
  const { isLoading, isSent, isError, message } = apiStatus;
  const {
    description,
    display_name,
    index,
    manager_display_name,
    physicalDeliveryOfficeName,
    username,
  } = userDataForEditRecordsModal;

  const sendRecords = () => {
    setApiStatus({
      isLoading: true,
      isSent: false,
      isError: false,
      message: '',
    });

    const recordsToSend = _.sortBy(newEditedRecords, 'dayIdx').map(
      (record) => ({
        username,
        record_date: format(addDays(selectedDate, record.dayIdx), 'yyyy-MM-dd'),
        user_status_id: record.user_status_id,
        record_status_id: 2,
        mailData: {
          display_name,
          mail: null,
        },
      })
    );

    axios
      .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/records/add-record`, {
        records: recordsToSend,
        // rawRecords: newRecords,
        recordsStartDate: format(selectedDate, 'd MMMM yyyy'),
        recordsEndDate: format(addDays(selectedDate, 4), 'd MMMM yyyy'),
        prevRecordsExist: true,
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
    if (isSent) fetchTableData();
    setIsOpen(false);
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
                <Dialog.Panel className='w-full max-w-md transform rounded-xl bg-white text-left align-middle text-sm shadow-xl transition-all'>
                  <div className='flex items-center justify-between border-b border-gray-200 pl-6 pr-3 '>
                    <Dialog.Title
                      as='h3'
                      className='py-3 text-lg font-bold text-gray-900'
                    >
                      {display_name}
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className='rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    >
                      <XMarkIcon className='h-5 w-5' />
                    </button>
                  </div>
                  <div className='flex flex-col gap-8 p-6'>
                    <div>
                      <ul className='flex flex-col gap-4'>
                        {days.map((day, dayIdx) => {
                          return (
                            <li
                              className='flex items-center justify-between gap-2'
                              key={day}
                            >
                              <div className='flex gap-2'>
                                <span>
                                  {format(
                                    addDays(selectedDate, dayIdx),
                                    'd MMMM'
                                  )}
                                </span>
                                <span>{day}</span>
                              </div>
                              <ModalStatusSelect
                                selectedId={
                                  newEditedRecords.find(
                                    (x) => x.dayIdx == dayIdx
                                  ).user_status_id
                                }
                                isFromEditRecordsModal={true}
                                setNewEditedRecords={setNewEditedRecords}
                                userStatuses={userStatuses}
                                day={dayIdx}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
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

                          {isSent === false ? (
                            <>
                              <button
                                onClick={sendRecords}
                                type='button'
                                className='inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
                              >
                                Gönder
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
