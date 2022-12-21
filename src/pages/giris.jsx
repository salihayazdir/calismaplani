import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import LoginForm from '../components/login/LoginForm';
import OtpForm from '../components/login/OtpForm';
import Steps from '../components/login/Steps';
import verifyToken from '../backend/verifyToken';
import Head from 'next/head';

export default function Giris() {
  const [loginStep, setLoginStep] = useState(1);
  const [loginFormData, setLoginFormData] = useState({
    username: '',
  });
  const [otpFormData, setOtpFormData] = useState({ otp: '' });
  const [loginStatus, setLoginStatus] = useState({
    isLoading: false,
    isError: false,
    message: '',
  });

  const router = useRouter();

  const handleLoginFormChange = (e) => {
    setLoginFormData({ [e.target.name]: e.target.value });
  };

  const handleOtpFormChange = (e) => {
    setOtpFormData({ [e.target.name]: e.target.value });
  };

  const handleLoginFormSubmit = async (e) => {
    e.preventDefault();
    setLoginStatus((prev) => ({
      ...prev,
      isError: false,
      isLoading: true,
      message: '',
    }));
    axios
      .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/login`, {
        username: loginFormData.username,
      })
      .then((res) => {
        // console.log(res);
        if (res.data.success === true) {
          setLoginStep(2);
          setLoginStatus({
            isLoading: false,
            isError: false,
            message: res.data.message || '',
          });
          localStorage.setItem('username', res.data.data.username);
        } else {
          setLoginStatus({
            isLoading: false,
            isError: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setLoginStatus({
          isLoading: false,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  const handleOtpFormSubmit = async (e) => {
    e.preventDefault();
    setLoginStatus((prev) => ({
      ...prev,
      isError: false,
      isLoading: true,
      message: '',
    }));
    axios
      .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/otp`, {
        username: localStorage.getItem('username') || null,
        otp: otpFormData.otp,
      })
      .then((res) => {
        // console.log(res);
        if (res.data.success === true) {
          setLoginStatus({
            isLoading: false,
            isError: false,
            message: '',
          });
          router.reload();
        } else {
          setLoginStatus({
            isLoading: false,
            isError: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setLoginStatus({
          isLoading: false,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  return (
    <>
      <Head>
        <title>Çalışma Planı | Kullanıcı Girişi</title>
        <meta name='Kullanıcı Girişi' content='' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex min-h-full items-center justify-center py-12 px-4'>
        <div className='border-gray-200pt-8 flex w-full max-w-md flex-col rounded-xl border bg-white '>
          <h2 className=' border-b border-gray-200 py-4 text-center text-xl font-bold tracking-tight text-gray-700'>
            Kullanıcı Girişi
          </h2>
          <Steps loginStep={loginStep} />
          {loginStatus.message && (
            <div
              className={`mx-10 mt-10 rounded-md bg-green-100 py-4 px-6 text-green-800 
          ${loginStatus.isError === true && 'bg-red-100 text-red-700'} `}
            >
              {loginStatus.message}
            </div>
          )}
          <div className='flex flex-col gap-10 p-10'>
            {loginStep === 1 && (
              <LoginForm
                loginFormData={loginFormData}
                handleLoginFormChange={handleLoginFormChange}
                handleLoginFormSubmit={handleLoginFormSubmit}
                isLoading={loginStatus.isLoading}
              />
            )}
            {loginStep === 2 && (
              <OtpForm
                otpFormData={otpFormData}
                handleOtpFormChange={handleOtpFormChange}
                handleOtpFormSubmit={handleOtpFormSubmit}
                isLoading={loginStatus.isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    if (context.req.headers.cookie) {
      const userData = await verifyToken(context.req.headers.cookie);
      if (userData) {
        if (userData.is_hr === true) throw '/dashboard';
        else if (
          userData.is_manager === true ||
          userData.isAuthorizedPersonnel === true
        )
          throw '/';
      }
    }
    return {
      props: {},
    };
  } catch (err) {
    if (err === '/giris' || err === '/' || err === '/dashboard')
      return {
        redirect: {
          permanent: false,
          destination: err,
        },
      };
    else {
      return {
        redirect: {
          permanent: false,
          destination: '/500',
        },
      };
    }
  }
}
