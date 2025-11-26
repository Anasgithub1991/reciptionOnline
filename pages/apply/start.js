import Head from 'next/head'
import Image from 'next/image'
import Router, { useRouter } from 'next/router'
import { useState, useContext,useEffect,useCallback } from 'react'
import AppContext from '../../context/appContext'

export default function Start() {

    const router = useRouter()
    const { step, setStep } = useContext(AppContext)

    const [agreement, setAgreement] = useState(false)


    // const getCaptchaData = useCallback(async () => {
    //     try {

    //         let response = await fetch(`../api/get_captcha`);
    //         const jsonData = await response.json();
    //         const data = jsonData['data'];
    //         console.log("data", data);

    //         // setCaptchaEncID(data?.encid);
    //         // setCaptchaImg(data?.captchaImage);
    //         // setCheckText(false)
    //     } catch (err) {
    //         console.error(err);
    //     }
    // }, []);

    // useEffect(() => {
    //     getCaptchaData()
    // }, [getCaptchaData])

    return (

        ( //step === 0 &&
            <>

                {/* <div className="bg-gray-300 sm:rounded-md mb-10 shadow ml-20 mr-20"> */}
                {/* <div className="md:grid md:grid-cols-4 md:gap-6"> */}

                <div className="p-2 md:p-4 shadow rounded-md md:mx-20 lg:mx-20 my-10 "
                    style={{ backgroundColor: "rgb(242, 243, 245)" }}
                >
                    {/* <div className="md:grid  md:gap-6"> */}
                    {/* <div className=" px-4 py-5 sm:p-10"> */}
                    <p>
                        الاستمارة الالكترونية للراغبين بالتقديم على الحجز الالكتروني لخدمات الاستعلامات الالكترونية وحسب الضوابط والتعليمات ادناه :
                    </p>
                    <br />
                    <ol className="space-y-4 " dir="rtl">
                        {/* <li>
                            <h2 className="mb-2 text-lg font-semibold dark:text-white" style={{color:'rgba(17,24,39,1)'}}>اولا : شروط التقديم</h2>
                        </li> */}
                        <li>
                            <ul className="space-y-4 pr-5" dir="rtl" >
                                <li className="flex items-center">
                                    <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="11" />
                                        <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                                    </svg>
                                    <p className="mr-4">
                                        <span className='font-bold'>تحقق من صحة المعلومات:</span> تأكد من إدخال جميع المعلومات بدقة وبدون أخطاء. تأكد من مطابقة البيانات مع الوثائق الرسمية ومعلومات العقد المروري.
                                    </p>
                                </li>
                                <li className="flex items-center"  >
                                    <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="11" />
                                        <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                                    </svg>
                                    <p className="mr-4" >
                                        <span className='font-bold'>استخدام بطاقة الهوية الموحدة:</span>  يجب أن تكون بطاقة الهوية المستخدمة في الطلب هي البطاقة الموحدة فقط. تأكد من أنها سارية المفعول وتحتوي على جميع المعلومات الصحيحة.
                                    </p>
                                </li>
                                <li className="flex items-center"  >
                                    <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="11" />
                                        <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                                    </svg>
                                    <p className="mr-4" >
                                        <span className='font-bold'>مراجعة المتطلبات والشروط:</span> اقرأ بعناية جميع المتطلبات والشروط المتعلقة بالمعاملة المطلوبة. تأكد من أن جميع الشروط متوفرة ان وجدت قبل التقديم .
                                    </p>
                                </li>

                                <li className="flex items-center"  >
                                    <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="11" />
                                        <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                                    </svg>
                                    <p className="mr-4" >
                                        <span className='font-bold'>اختر تاريخ الحجز:</span> بالامكان اختيار تاريخ الحجز المناسب وحسب الايام المتوفرة في الموقع الالكتروني.
                                    </p>
                                </li>
                                <li className="flex items-center"  >
                                    <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="11" />
                                        <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                                    </svg>
                                    <p className="mr-4" >
                                        <span className='font-bold'>مواعيد الحجز:</span> يكون ايام الحجز الالكتروني من يوم الاحد من بداية كل اسبوع الى يوم الخميس فقط مع مراعاة ايام العطل الرسمية وبخلافه يعتبر الحجز ملغى
                                    </p>
                                </li>
                                <li className="flex items-center"  >
                                    <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="11" />
                                        <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                                    </svg>
                                    <p className="mr-4" >
                                        <span className='font-bold'>اختر موقع التسجيل:</span> بالامكان اختيار موقع المراجعة حسب موقع التسجيل المتوفر للمعاملة المطلوبة.
                                    </p>
                                </li>
                                <li className="flex items-center"  >
                                    <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="11" />
                                        <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                                    </svg>
                                    <p className="mr-4" >

                                        <span className='font-bold'>تأكد من الأمان:</span>  عند تقديم الطلب عبر الإنترنت، تأكد من أنك تستخدم الموقع الرسمي الامن دون الحاجة الى التقديم عن طريق المكاتب الخارجية وذلك لحماية معلوماتك الشخصية.
                                    </p>
                                </li>
                                <li className="flex items-center"  >
                                    <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="11" />
                                        <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                                    </svg>
                                    <p className="mr-4" >
                                        <span className='font-bold'>التأكيد النهائي:</span> قبل إرسال الطلب، راجع جميع المعلومات مرة أخرى للتأكد من صحتها. بمجرد التأكد، قم بإرسال الطلب وانتظر تأكيد الاستلام ورمز الحجز.
                                    </p>
                                </li>

                            </ul>
                        </li>
                    </ol>
                    <br />
                    <br className='hidden md:flex' />
                    <br className='hidden md:flex' />
                    <br className='hidden md:flex' />
                    <br className='hidden md:flex' />
                    {/* <br className='hidden md:flex'/> */}
                    {/* <br className='hidden md:flex'/> */}

                    <div className="flex items-center mb-4">
                        <input id="default-checkbox" type="checkbox" value={agreement} className="mr-2 w-8 h-6 text-blue-600  border-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 " onChange={e => setAgreement(e.target.checked)} />
                        <label htmlFor='default-checkbox' className="mr-2 text-base md:text-lg font-semibold  text-red-600 ">اوافق على جميع الشروط و التعليمات واتحمل المسؤولية القانونية عن صحة كافة المعلومات المدخلة في الاستمارة الالكترونية</label>
                    </div>
                    <div className="container min-h-[100px] py-5 px-10 mx-0 min-w-full flex flex-col items-center">
                        <button
                            type="button"
                            style={{ backgroundColor: "rgb(2 132 199 / 1)" }}
                            // className="inline-flex justify-end rounded-md border border-transparent bg-gray-400 py-2 px-4 text-xl font-medium text-zinc-800 shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            className="text-white hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 font-medium text-xl rounded-lg px-5 py-2.5 mr-2 mb-2 dark:bg-gray-400 dark:hover:bg-sky-700 focus:outline-none dark:focus:ring-blue-800 content-center w-64"
                            // style={{ 'backgroundColor': "rgba(0, 110, 169 / 90%)" }}
                            disabled={!agreement}
                            hidden={!agreement}
                            onClick={(e) => {
                                // nextClk(e)
                                setStep(1);
                                router.push('/apply/application');
                            }}
                        >فتح الاستمارة الالكترونية</button>
                    </div>

                </div>


            </>

        )

    )

}
