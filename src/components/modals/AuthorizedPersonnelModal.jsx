import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import AuthorizedPersonnelConfirmationModal from './AuthorizedPersonnelConfirmationModal';

import {
  XMarkIcon,
  ExclamationCircleIcon,
  CheckIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export default function AuthorizedPersonnelModal({
  isOpen,
  setIsOpen,
  authorizedPersonnel,
  setAuthorizedPersonnel,
  directReportsWithoutManager,
}) {
  const [
    authorizedPersonnelConfirmationModalIsOpen,
    setAuthorizedPersonnelConfirmationModalIsOpen,
  ] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState({
    action: null,
    username: null,
    display_name: null,
  });

  const handleClose = () => {
    setIsOpen(false);
  };

  const handlePermissionChangeButton = (user, action) => {
    setSelectedPersonnel({ action, ...user });
    setAuthorizedPersonnelConfirmationModalIsOpen(true);
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
                      Yetkili Kullanıcılar
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className='rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    >
                      <XMarkIcon className='h-5 w-5' />
                    </button>
                  </div>
                  <div className='flex items-center gap-4  py-2 px-6 text-xs text-gray-600'>
                    <ExclamationCircleIcon className='h-14 w-14 text-yellow-500' />
                    <p>
                      Yetkilendireceğiniz kullanıcılar yöneticisi adına, bağlı
                      olduğu birimin tüm çalışanlarının haftalık kayıtlarını
                      gönderebilir.
                    </p>
                  </div>

                  <div className='flex flex-col gap-6 '>
                    <div></div>
                    <div className='flex flex-col divide-y border-y border-gray-200 text-xs'>
                      {directReportsWithoutManager.map((user) => {
                        const isAuthorized = Boolean(
                          authorizedPersonnel.indexOf(user.username) !== -1
                        );
                        return (
                          <div
                            key={user.username}
                            className={` flex items-center justify-between py-1.5 px-6 hover:bg-slate-50 `}
                          >
                            <span
                              className={` ${
                                isAuthorized
                                  ? 'font-medium text-gray-800'
                                  : ' text-gray-500'
                              } `}
                            >
                              {user.display_name}
                            </span>
                            <div className='flex items-center gap-4'>
                              {isAuthorized ? (
                                <div
                                  className={`inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-center text-green-700 outline outline-1 outline-green-400 
                                   `}
                                >
                                  <span>Yetkili</span>
                                  <CheckIcon className='h-4 w-4  ' />
                                </div>
                              ) : null}
                              <div className=''>
                                {isAuthorized ? (
                                  <button
                                    onClick={() =>
                                      handlePermissionChangeButton(
                                        user,
                                        'delete'
                                      )
                                    }
                                    className='group inline-flex justify-between gap-2 rounded-full bg-white py-1 pl-3 pr-2 text-gray-500 shadow-sm outline outline-1 outline-gray-200 hover:bg-red-500 hover:text-white hover:outline-red-500'
                                  >
                                    <span>Kaldır</span>
                                    <TrashIcon className='h-4 w-4 text-red-500 group-hover:text-white' />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handlePermissionChangeButton(user, 'add')
                                    }
                                    className='group inline-flex justify-between gap-2 rounded-full bg-white py-1 pl-3 pr-2 text-gray-500 shadow-sm outline outline-1 outline-gray-200 hover:bg-green-500 hover:text-white hover:outline-green-500'
                                  >
                                    <span>Yetki Ver</span>
                                    <PlusIcon className='h-4 w-4 text-green-500 group-hover:text-white' />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div></div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {authorizedPersonnelConfirmationModalIsOpen ? (
        <AuthorizedPersonnelConfirmationModal
          isOpen={authorizedPersonnelConfirmationModalIsOpen}
          setIsOpen={setAuthorizedPersonnelConfirmationModalIsOpen}
          selectedPersonnel={selectedPersonnel}
          setAuthorizedPersonnel={setAuthorizedPersonnel}
        />
      ) : null}
    </>
  );
}
