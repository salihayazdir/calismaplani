import { Dialog, Transition } from '@headlessui/react';
import Loader from '../skeletons/Loader';
import { Fragment, useState } from 'react';
import axios from 'axios';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function AuthorizedPersonnelConfirmationModal({
  isOpen,
  setIsOpen,
  selectedPersonnel,
  fetchDirectReports,
}) {
  const [apiStatus, setApiStatus] = useState({
    isLoading: false,
    isSent: false,
    isError: false,
    message: '',
  });
  const { isLoading, isSent, isError, message } = apiStatus;
  const { action, username, display_name } = selectedPersonnel;

  const updateUserPermission = () => {
    setApiStatus({
      isLoading: true,
      isSent: false,
      isError: false,
      message: '',
    });

    if (action === 'add') {
      axios
        .post(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/users/authorized-personnel/add`,
          {
            username,
          }
        )
        .then((res) => {
          console.log(res);
          if (res.data.success === true) {
            setApiStatus({
              isLoading: false,
              isSent: true,
              isError: false,
              message: res.data.message || '',
            });
            fetchDirectReports();
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
    }

    if (action === 'delete') {
      axios
        .delete(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/users/authorized-personnel/delete`,
          {
            data: {
              username,
            },
          }
        )
        .then((res) => {
          // console.log(res);
          if (res.data.success === true) {
            setApiStatus({
              isLoading: false,
              isSent: true,
              isError: false,
              message: res.data.message || '',
            });
            fetchDirectReports();
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
    }
  };

  const handleClose = () => {
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
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all'>
                  <div className='flex items-center justify-between border-b border-gray-200 pl-6 pr-3 '>
                    <Dialog.Title
                      as='h3'
                      className='py-3 text-lg font-bold text-gray-900'
                    >
                      {`${
                        action === 'add'
                          ? 'Kullanıcı Yetkilendir'
                          : 'Yetki Kaldır'
                      }`}
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className='rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    >
                      <XMarkIcon className='h-5 w-5' />
                    </button>
                  </div>
                  <div className='flex items-center gap-4 px-6 py-4 text-sm text-gray-700'>
                    <ExclamationCircleIcon className='h-20 w-20 text-yellow-500' />
                    <p>
                      <span className=''>{`Onaylamanız halinde `}</span>
                      <span className='font-semibold'>{`${display_name} `}</span>
                      <span className=''>{`isimli kullanıcı`}</span>
                      <span className=''>{`${
                        action === 'add'
                          ? ' sizin adınıza haftalık kayıt gönderebilecektir.'
                          : ''
                      }`}</span>
                      <span className=''>{`${
                        action === 'delete'
                          ? 'nın haftalık kayıt gönderme yetkisi kaldırılacaktır.'
                          : ''
                      }`}</span>
                    </p>
                  </div>
                  <div className='flex flex-col gap-6 p-6 pt-3'>
                    {isLoading === true ? (
                      <div className='flex w-full flex-col items-center justify-center gap-6 text-center '>
                        <div className='w-full rounded-md bg-gray-50 p-4 text-gray-800'>
                          <p>Kullanıcı yetkileri güncelleniyor...</p>
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
                          onClick={updateUserPermission}
                          type='button'
                          className={`${
                            action === 'delete'
                              ? 'bg-red-500 hover:bg-red-600'
                              : ''
                          } ${
                            action === 'add'
                              ? 'bg-green-500 hover:bg-green-600'
                              : ''
                          } inline-flex justify-center rounded-md border border-transparent px-4 py-3 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200`}
                        >
                          {`${action === 'delete' ? 'Yetkileri Kaldır' : ''}${
                            action === 'add' ? 'Onayla ve Yetkilendir' : ''
                          }`}
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
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
