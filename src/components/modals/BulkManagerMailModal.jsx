import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import Loader from '../skeletons/Loader';
import { Fragment, useState, useRef } from 'react';
import { startOfISOWeek, format } from 'date-fns';
import { XMarkIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function BulkManagerMailModal({
  isOpen,
  setIsOpen,
  selectedDate,
  mailList,
}) {
  const [mailStatus, setMailStatus] = useState({
    isLoading: false,
    isSent: false,
    isError: false,
    message: '',
  });
  const { isLoading, isSent, isError, message } = mailStatus;
  const [mailMessageInput, setMailMessageInput] = useState('');

  const handleEmailFormSubmit = (e) => {
    e.preventDefault();
    setMailStatus({
      isLoading: true,
      isSent: false,
      isError: false,
      message: '',
    });

    axios
      .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/mail/bulk`, {
        mailReceivers: mailList,
        mailSubject: `${format(
          startOfISOWeek(selectedDate),
          'dd/MM/yyyy'
        )} haftası personel kayıt çizelgesi için hatırlatma.`,
        mailTextField: mailMessageInput,
      })
      .then((res) => {
        if (res.data.success === true) {
          setMailStatus({
            isLoading: false,
            isSent: true,
            isError: false,
            message: res.data.message || 'Başarılı',
          });
        } else {
          setMailStatus({
            isLoading: false,
            isSent: true,
            isError: true,
            message: res.data.message || 'E-posta gönderilemedi.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setMailStatus({
          isLoading: false,
          isSent: true,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const messageFieldRef = useRef(null);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          initialFocus={messageFieldRef}
          as='div'
          className='relative z-10'
          onClose={handleClose}
        >
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
                      Tüm Yöneticilere Hatırlat
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className='rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    >
                      <XMarkIcon className='h-5 w-5' />
                    </button>
                  </div>

                  <div className='flex flex-col gap-6 p-6'>
                    {/* <div>
                      <div className='flex  flex-col rounded-lg border border-gray-200 bg-gray-50 text-gray-600 '>
                        <span className='inline-flex items-center gap-4 border-b border-gray-200 px-4 py-[6px] font-medium '>
                          <UserIcon className='h-5 w-5' />
                          "name"
                        </span>
                        <span className='inline-flex items-center gap-4 py-[6px] px-4 font-light'>
                          <EnvelopeIcon className='h-5 w-5' />
                          "mail"
                        </span>
                      </div>
                    </div> */}
                    <form
                      className='flex flex-col gap-6'
                      onSubmit={handleEmailFormSubmit}
                    >
                      <div className='flex flex-col rounded-lg border border-gray-200'>
                        <h3 className='border-b border-gray-200 px-4 py-2 font-medium text-gray-600'>
                          {`${format(
                            startOfISOWeek(selectedDate),
                            'dd/MM/yyyy'
                          )} haftası personel kayıt çizelgesi için hatırlatma.`}
                        </h3>
                        <textarea
                          ref={messageFieldRef}
                          className='rounded-b-lg py-2 px-4 text-sm text-gray-600 focus:outline-2 focus:outline-blue-300 disabled:text-gray-400'
                          id='mailMessageInput'
                          name='mailMessageInput'
                          value={mailMessageInput}
                          disabled={isLoading || isSent}
                          type='text'
                          placeholder='Mesajınız...'
                          onChange={(e) => setMailMessageInput(e.target.value)}
                        />
                      </div>

                      {isSent === true && isLoading === false ? (
                        <div
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
                            : 'E-posta başarıyla gönderildi.'}
                        </div>
                      ) : null}

                      {isLoading === true ? (
                        <div className='flex w-full justify-center text-center '>
                          <Loader />
                        </div>
                      ) : null}

                      {isSent === false && isLoading === false ? (
                        <button
                          type='submit'
                          className='inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
                        >
                          E-posta Gönder
                        </button>
                      ) : null}

                      {isSent === true ? (
                        <button
                          className='inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-3 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
                          type='button'
                          onClick={handleClose}
                        >
                          Tamam
                        </button>
                      ) : null}
                    </form>
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
