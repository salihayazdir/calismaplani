import React from 'react';
import {
  ExclamationCircleIcon,
  ArrowPathIcon,
  FaceFrownIcon,
} from '@heroicons/react/24/outline';
import { withRouter } from 'next/router';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI

    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can use your own error logging service here
    console.log({ error, errorInfo });
  }
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className='flex min-h-full items-center justify-center py-12 px-4'>
          <div className='flex w-full max-w-md flex-col gap-8 rounded-xl border border-gray-200 bg-white py-8 shadow-lg  '>
            <div className='px-8'>
              <div className='flex items-center justify-center gap-4 rounded-lg bg-red-50 py-4 font-medium text-gray-700'>
                <FaceFrownIcon className='h-10 w-10 text-red-500' />
                <h2 className='text-red-700'>{`Bir hata oluştu :-/`}</h2>
              </div>
            </div>
            <div className='px-8'>
              <button
                type='button'
                onClick={() => {
                  this.setState({ hasError: false });
                  this.props.router.reload();
                }}
                className='inline-flex w-full items-center justify-center gap-4 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600'
              >
                <span>Sayfayı Yenile</span>
                <ArrowPathIcon className='h-6 w-6' />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Return children components in case of no error

    return this.props.children;
  }
}

export default withRouter(ErrorBoundary);
