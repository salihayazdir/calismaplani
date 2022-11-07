import { Dialog, Transition } from '@headlessui/react';
import Loader from '../skeletons/Loader';
import { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';

export default function UpdateUsersModal({ isOpen, setIsOpen }) {
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

    axios
      .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/users/update`)
      .then((res) => {
        console.log(res);
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
    // setApiStatus({
    //   isLoading: false,
    //   isSent: false,
    //   isError: false,
    //   message: '',
    // });
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
                      Kullanıcıları Güncelle
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className='rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    >
                      <XMarkIcon className='h-5 w-5' />
                    </button>
                  </div>

                  {isSent === false && isLoading === false && (
                    <div className='px-6 pt-4'>
                      <div className='flex flex-col rounded-md bg-gray-50 p-4 text-gray-800'>
                        Onaylamanız halinde tüm personel bilgileri
                        güncellenecektir.
                      </div>
                    </div>
                  )}

                  <div className='flex flex-col gap-6 p-6'>
                    <div className='flex flex-col gap-6'>
                      {isLoading === true ? (
                        <div className='flex w-full flex-col items-center justify-center gap-6 text-center '>
                          <div className='w-full rounded-md bg-gray-50 p-4 text-gray-800'>
                            <p>Kullanıcılar güncelleniyor.</p>
                            <p>Bu işlem birkaç dakika sürebilir.</p>
                          </div>
                          <Loader />
                        </div>
                      ) : null}

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

                      {isSent === false && isLoading === false ? (
                        <>
                          <button
                            onClick={sendRecords}
                            type='button'
                            className='inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
                          >
                            Onayla ve Güncelle
                          </button>
                          <button
                            onClick={handleClose}
                            type='button'
                            className='-mt-4 -mb-2 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
                          >
                            İptal
                          </button>
                        </>
                      ) : null}

                      {isSent === true && isLoading === false ? (
                        <button
                          className='inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-3 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
                          // type='button'
                          onClick={handleClose}
                        >
                          Tamam
                        </button>
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
