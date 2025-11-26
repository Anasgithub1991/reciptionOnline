import '../styles/globals.css'
import { default as Layout } from '../components/layout'
import Spinner from '../components/Spinner'
import { StrictMode, useState, useRef, useEffect } from 'react';
import AppContext from '../context/appContext';
import 'react-toastify/dist/ReactToastify.css'
// import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'


export default function MyApp({ Component, pageProps }) {

  const [isLoading, setIsLoading] = useState(false)
  const [reqInfo, setReqInfo] = useState({ nanoid: null, phone: null, reqid: null });

  const [step, setStep] = useState(0)

  const showLoading = (newState) => {
    setIsLoading(newState)
  }
  const updateReqInfo = (newNanoid, newPhone,resDate, newReqID) => {
    setReqInfo({ ...reqInfo, nanoid: newNanoid, phone: newPhone, resDate: resDate, reqid: newReqID });
  };


  return (
    <>
      <StrictMode>
        {/* <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_SITE_KEY_V3}> */}

        <AppContext.Provider value={{ reqInfo, updateReqInfo, isLoading, showLoading, step, setStep }}>
          {/* {typeof window !== 'undefined' && */}
          <Layout>
            <Spinner loading={isLoading} />
            <Component {...pageProps} />
          </Layout>
        </AppContext.Provider>
        {/* </GoogleReCaptchaProvider> */}
      </StrictMode>
      {/* } */}
    </>
  );
}