/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from "next/router"
import React, { useState, useEffect, useLayoutEffect, useCallback, useRef, useContext } from "react"
import { ToastContainer, toast } from 'react-toastify';
import AppContext from "../../context/appContext";
import 'react-toastify/dist/ReactToastify.css';

const CAPTCHA_EXPIRY_TIME = 300; // CAPTCHA expiry time in seconds

export default function Verify() {

  const router = useRouter()
  const Ref = useRef(null)
  // context data
  const { reqInfo, showLoading, step, setStep } = useContext(AppContext)

  //Ayham captcha ***************************************************
  const [countdown, setCountdown] = useState(CAPTCHA_EXPIRY_TIME); // State to track countdown
  const intervalRef = useRef(null);
  const didRequestRef = useRef(false);
  const [inValue, setInValue] = useState(null)
  // const [checkText, setCheckText] = useState(false)

  // Captcha vars**********************************************
  const [captchaQuestion, setCaptchaQuestion] = useState()
  const [captchaToken, setCaptchaToken] = useState()
  const [captchaImg, setCaptchaImg] = useState()
  const getCaptchaData = useCallback(async (phoneNo) => {
    try {

      let response = await fetch(`../api/get_captcha?phone_no=${phoneNo}`);
      const jsonData = await response.json();
      const data = jsonData['data'];
      if (jsonData["success"] === true) {
        setCaptchaImg(data?.captchaImage);
        setCaptchaQuestion(data?.captchaQuestion);
        setCaptchaToken(data?.token);
      }

    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    // Only proceed if phone and step == 2
    if (reqInfo?.phone && step === 2) {
      if (!didRequestRef.current) {
        didRequestRef.current = true;
        getCaptchaData(reqInfo.phone); // Initial call

        setCountdown(CAPTCHA_EXPIRY_TIME);

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev === 1) {
              getCaptchaData(reqInfo.phone);
              return CAPTCHA_EXPIRY_TIME;
            }
            return prev - 1;
          });
        }, 1000);
      }
      // Cleanup
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        didRequestRef.current = false; // Reset for next mount/change
      };
    }
    // Cleanup if phone/step not valid
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      didRequestRef.current = false;
    };
  }, [reqInfo?.phone, step, getCaptchaData]);

  const resetCaptchaTimer = async () => {
    if (!reqInfo?.phone) return;

    // 1. Call API
    await getCaptchaData(reqInfo.phone);

    // 2. Reset countdown state
    setCountdown(CAPTCHA_EXPIRY_TIME);

    // 3. Clear existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // 4. Start new interval
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          getCaptchaData(reqInfo.phone);
          return CAPTCHA_EXPIRY_TIME;
        }
        return prev - 1;
      });
    }, 1000);
    setInValue(null)
  };

  // timer format function
  function formatSecondsToClock(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${paddedMinutes}:${paddedSeconds}`;
  }

  const handleInputChange = (e) => {
    // setCheckText(true)
    setInValue(e.target.value);
    // setCountdown(CAPTCHA_EXPIRY_TIME); // Reset countdown timer to 30 
    // updateCaptchaData(captchaEncID, reqInfo?.phone)
  };

  // end ayham captcha ***************************************************

  const [timer, setTimer] = useState('00:00')
  const [otp, setOtp] = useState('')
  // const [otpVerified, setOtpVerified] = useState(false)
  // const captchaRef = useRef(null)

  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return {
      total, minutes, seconds
    };
  }

  const startTimer = (e) => {
    let { total, minutes, seconds }
      = getTimeRemaining(e);
    if (total >= 0) {

      // update the timer
      // check if less than 10 then we need to
      // add '0' at the beginning of the variable
      setTimer(
        ('0' + minutes) + ':'
        + (seconds > 9 ? seconds : '0' + seconds)
      )
    }
  }
  const clearTimer = (e) => {

    // If you adjust it you should also need to
    // adjust the Endtime formula we are about
    // to code next   
    setTimer('05:00');
    // If you try to remove this line the
    // updating of timer Variable will be
    // after 1000ms or 1sec
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      startTimer(e);
    }, 1000)
    Ref.current = id;
  }

  const getDeadTime = () => {
    let deadline = new Date();

    // This is where you need to adjust if
    // you entend to add more time
    deadline.setSeconds(deadline.getSeconds() + 5 * 60);
    return deadline;
  }

  // We can use useEffect so that when the component
  // mount the timer will start as soon as possible
  // We put empty array to act as componentDid
  // mount only
  useEffect(() => {
    clearTimer(getDeadTime());
  }, []);

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  // console.log("reqInfo", reqInfo);
  const verifyOtp = async (e) => {
    // e.preventDefault()
    let url = '../api/verifyotp'
    let body = JSON.stringify({
      nanoid: reqInfo?.nanoid ?? null,
      otp: otp ?? null,
      phone: reqInfo?.phone,
      token: captchaToken,
      captchaCode: inValue
    })
    let method = 'POST'
    let headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    }

    try {
      showLoading(true)
      let response = await fetch(url, { method, headers, body })
      let jsonData = await response.json()
      if (jsonData["success"] === false) {
        showLoading(false)
        if (jsonData["error"].errCaptcha === true) {
          return toast.error('خطأ في تحقق السؤال ', {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
        if (jsonData["error"].otpError === true) {
          await resetCaptchaTimer()
          // if (intervalRef.current) clearInterval(intervalRef.current);
          // didRequestRef.current = false;
          return toast.error('خطأ في تحقق sms ', {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
        return toast.error('خطأ حصل في التحقق ', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
      toast.success('تم التحقق بنجاح !', {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      })

      sleep(1000).then(() => {
        showLoading(false)
        setStep(3);
        router.push({ pathname: '/apply/finish' })
        return
      })
    } catch (err) {
      showLoading(false)
      return toast.error('خطأ في الشبكة ', {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }

  // const resendOtp = async (e) => {
  //   // e.preventDefault()
  //   let url = '../api/resendotp'
  //   let body = JSON.stringify({
  //     nanoid: reqInfo?.nanoid,
  //     phone: reqInfo?.phone,
  //     toekn: captchaToken,
  //     captchaCode: inValue
  //   })
  //   let method = 'POST'
  //   let headers = {
  //     "Access-Control-Allow-Origin": "*",
  //     "Content-Type": "application/json",
  //   }

  //   try {
  //     showLoading(true)
  //     let response = await fetch(url, { method, headers, body })
  //     let jsonData = await response.json()
  //     if (jsonData.success === false) {
  //       showLoading(false)
  //       if (jsonData['error']?.errCaptcha === true) {
  //         return toast.error('يرجى التأكد من رمز التحقق، اعد المحاولة', {
  //           position: "bottom-center",
  //           autoClose: 5000,
  //           hideProgressBar: false,
  //           closeOnClick: true,
  //           pauseOnHover: true,
  //           draggable: true,
  //           progress: undefined,
  //           theme: "light",
  //         });
  //       } else {
  //         return toast.error('خطأ في ارسال الطلب ', {
  //           position: "bottom-center",
  //           autoClose: 5000,
  //           hideProgressBar: false,
  //           closeOnClick: true,
  //           pauseOnHover: true,
  //           draggable: true,
  //           progress: undefined,
  //           theme: "light",
  //         });
  //       }
  //     }
  //     showLoading(false)
  //     getCaptchaData(reqInfo?.phone)
  //     toast.success('تم اعادة ارسال رمز التحقق !', {
  //       position: "bottom-center",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //       theme: "light",
  //     })
  //     clearTimer(getDeadTime());
  //     return
  //   } catch (err) {
  //     // console.log(err)
  //     showLoading(false)
  //     return toast.error('خطأ في الشبكة ', {
  //       position: "bottom-center",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //       theme: "light",
  //     });
  //   }
  // }

  // Create an event handler so you can call the verification on button click event or form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    verifyOtp(e)
  }

  // Create an event handler so you can call the verification on button click event or form submit
  // const handleResend = async (e) => {
  //   e.preventDefault()
  //   // resendOtp(e)
  // }

  useEffect(() => {
    if (step != 2) {
      setStep(0);
      router.push('/apply/start')
    }
  }, [])

  useEffect(() => {
    if (reqInfo.phone === null | reqInfo.nanoid === null | reqInfo.nanoid === '' | reqInfo.phone === '') router.push('/apply/start')
  }, [reqInfo])

  return (
    (
      step === 2 &&
      <>
        {/* <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_SITE_KEY_V3}> */}
        <div className={"flex flex-col justify-centers items-center "}>
          <div className="w-fit rounded bg-gradient-to-r bg-slate-400 via-green-500 to-blue-500 p-1 my-4 ">
            <div className="flex flex-col items-center space-y-2 bg-white p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-2xl  text-transparent">عزيزي المواطن</h1>
              <p className="text-center text-lg"> <b>تم تقديم طلب الحجز بنجاح سيتم ارسال رسالة نصية لغرض التأكيد </b></p>
              <div style={{ backgroundColor: "rgb(51 103 145 / 85%)", marginTop: "40px" }} className="w-full rounded-md p-1 my-4">
                <h3 className="text-xl text-center font-bold leading-6 text-gray-50 m-3 ">ادخل معلومات التحقق لتأكيد التقديم</h3>
              </div>
              <div className="py-2 w-full" >
                <div className="canv py-2" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                  <img style={{ borderRadius: "5px", overflow: "hidden", border: "1px solid lightgray" }} src={captchaImg} alt="CAPTCHA" />
                </div>
                <div className=" px-4">
                  <p style={{ marginTop: '10px' }}>{captchaQuestion}</p>
                  <p style={{ marginTop: '10px' }}>الوقت المتبقي للشكل الحالي: {formatSecondsToClock(countdown) } ثانية</p>
                  <input
                    type="text"
                    className="mt-3 w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 "
                    value={inValue}
                    onChange={(e) => { handleInputChange(e) }}
                    ref={intervalRef} placeholder="ادخل حل السؤال اعلاه" autoComplete="off" />
                </div>
              </div>
              <div className="w-full text-right  ">
                <div className="py-2   ">
                  <div className="px-4" >
                    <p style={{ marginTop: '10px' }}> تنتهي صلاحية SMS بعد: {timer} ثانية</p>
                    <input
                      onChange={e => { setOtp(e.target.value) }}
                      type="text"
                      placeholder="ادخل رمز SMS"
                      disabled={timer === '00:00'}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 "
                    />
                  </div>
                </div>
                {/* <div className="flex col-span-2  justify-center justify-items-center ">
                  <button
                    className="text-blue-600 bg-transparent text-base"
                    hidden={!(timer === '00:00')}
                    onClick={(e) => handleResend(e)}
                  >اعادة ارسال</button>
                </div> */}
              </div>
              <div className="px-4 py-3  sm:px-6 flex space-x-2 justify-center p-3">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent
                                    bg-sky-600 text-white hover:bg-sky-700 focus:ring-4 py-2 px-10 text-xl 
                                    font-medium  shadow-sm  focus:outline-none focus:ring-sky-500 focus:rin    g-offset-2
                                    disabled:bg-gray-300 disabled:text-slate-400
                                    "
                  style={{ minWidth: '230px' }}
                  // className="inline-flex justify-center items-center rounded-md border border-transparent bg-gray-400 py-2 px-4 text-lg  font-medium text-gray-900 shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={(e) => handleSubmit(e)}
                > تحقق</button>
              </div >
            </div>
          </div>
          < div className="" >
            <ToastContainer />
          </div >
        </div >
      </>
    )
  )
}
