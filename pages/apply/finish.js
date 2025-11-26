/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from "next/router"
import React, { useContext, useEffect } from "react"
import { ToastContainer, toast } from 'react-toastify';
import AppContext from "../../context/appContext";
import { decrypt } from '../api/crypto'

export default function Finish() {
    const router = useRouter()
    const { reqInfo, updateReqInfo } = useContext(AppContext)
    const { step, setStep } = useContext(AppContext)
    useEffect(() => {
        if (step != 3) {
            setStep(0);
            router.push('/apply/start')
        }
    }, [])
    const handlePrint = () => {
        setStep(4);
        router.push({ pathname: '/apply/printform' })
    }

    const handleHome = () => {
        updateReqInfo(null)
        router.push({ pathname: '/apply/start' })
    }
    return (
        (step === 3 &&
            <>
                <div className=" flex flex-col justify-centers h-screen items-center ">
                    <div className="rounded bg-gradient-to-r bg-slate-400 via-green-500 to-blue-500 p-1 my-32 ">
                        <div className="flex flex-col items-center space-y-2 bg-white p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-28 w-28 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-3xl text-transparent">عزيزي المواطن</h1>
                            <p className="text-center"> تم تثبيت طلب الحجز بنجاح بامكانك مراجعة الاستعلامات الالكترونية في الموعد المطلوب</p>
                            <div className="col-span-5 sm:col-span-1">
                                <p className="text-center text-lg font-bold">رقم الحجز :{decrypt(reqInfo?.nanoid)}</p>
                                <p className="text-center text-lg font-bold">تاريخ الحجز :{reqInfo?.resDate}</p>
                            </div>
                            <br />
                            <div className="col-span-5 sm:col-span-1">
                                <button
                                    type="submit"
                                    className="inline-flex justify-end rounded-md border border-transparent
                                             bg-sky-600 text-white hover:bg-sky-700 focus:ring-4 py-2 px-8 text-xl 
                                             font-medium  shadow-sm  focus:outline-none focus:ring-sky-500 focus:rin g-offset-2
                                             disabled:bg-gray-300 disabled:text-slate-400 "
                                    style={{ minWidth: '230px' }}
                                    // className="inline-flex justify-center items-center rounded-md border border-transparent bg-gray-400 py-2 px-4 text-lg  font-medium text-gray-900 shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    onClick={() => handlePrint()}
                                > طباعة استمارة الحجز</button>
                            </div >
                            <div className="col-span-5 sm:col-span-1">
                                <button
                                    type="submit"
                                    className="inline-flex justify-end rounded-md border border-transparent
                                    bg-sky-600 text-white hover:bg-sky-700 focus:ring-4 py-2 px-10 text-xl 
                                    font-medium  shadow-sm  focus:outline-none focus:ring-sky-500 focus:rin    g-offset-2
                                    disabled:bg-gray-300 disabled:text-slate-400
                                    "
                                    style={{ minWidth: '230px' }}
                                    // className="inline-flex justify-center items-center rounded-md border border-transparent bg-gray-400 py-2 px-4 text-lg  font-medium text-gray-900 shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    onClick={() => handleHome()}
                                > عودة الى الرئيسية</button>
                            </div >
                        </div>
                    </div>
                </div>
            </>
        )
    )
}