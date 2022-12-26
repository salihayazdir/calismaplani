import Loader from '../skeletons/Loader';

export default function LoginForm({
  loginFormData,
  handleLoginFormChange,
  handleLoginFormSubmit,
  isLoading,
}) {
  return (
    <form className='flex flex-col' onSubmit={handleLoginFormSubmit}>
      <div className='relative rounded-md '>
        <input
          id='username'
          name='username'
          type='text'
          required
          disabled={isLoading}
          pattern='^[A-Za-z]{5,7}$'
          value={loginFormData.username}
          onChange={handleLoginFormChange}
          className='peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent p-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-0 disabled:text-gray-500 '
          placeholder=' '
        />
        <label
          htmlFor='username'
          className='absolute top-1 left-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-1 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-500 '
        >
          Kullanıcı Adınız
        </label>
      </div>
      <p className='mt-2 text-xs text-gray-400'>
        6 harften oluşan Bileşim kullanıcı adınız.
      </p>
      {isLoading ? (
        <div className=' mt-8 flex w-full justify-center text-center '>
          <Loader />
        </div>
      ) : (
        <button
          type='submit'
          className='group relative mt-8 flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-4 px-4 text-base font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        >
          Gönder
        </button>
      )}
    </form>
  );
}
