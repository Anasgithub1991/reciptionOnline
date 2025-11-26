/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from "next/router"
import profilePic from '../../public/moi_svg.svg'
import Image from 'next/image'
import React, { useState, useContext, useEffect, useCallback, useRef } from "react"
import QRCode from "react-qr-code";
import { useReactToPrint } from 'react-to-print'
import { ToastContainer, toast } from 'react-toastify';
import dayjs from 'dayjs'
import AppContext from "../../context/appContext";
import { decrypt } from '../api/crypto'

export default function Finish() {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        pageStyle: `@media print {
            @page { 
                size: auto !important; 
                margin:0.5cm 0.5cm;
            }
          }`,
        content: () => componentRef.current,
        documentTitle: 'req-data',
        documentDirection: 'ltr',
        onafterprint: () => alert('Print success')

    });

    const router = useRouter()
    const { reqInfo, updateReqInfo } = useContext(AppContext)
    const { step, setStep } = useContext(AppContext)
    // useEffect(() => {
    //     if (step != 4) {
    //         setStep(0);
    //         router.push('/apply/start')
    //     }
    // }, [])

    const [reservInfo, setReservInfo] = useState([])
    const getReservInfo = useCallback(async () => {
        try {
            let method = 'POST'
            let headers = {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            }
            let body = JSON.stringify({
                nanoid: reqInfo?.nanoid ?? null,
            })
            let response = await fetch(`../api/reserv_info`, { method, headers, body })
            const jsonData = await response.json();
            setReservInfo(jsonData['data'][0])
            // console.log('data', jsonData['data'][0]);

        } catch (err) {
            console.error(err)
        }
    }, [])

    useEffect(() => {
        getReservInfo()
    }, [getReservInfo])
    // console.log('reservInfo', reservInfo);

    return (
        (step === 4 &&
            <>
                <div style={{ display: 'flex', justifyContent: 'right', alignItems: 'end', marginBottom: '10px', marginTop: '10px' }}>
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent
                                    bg-sky-600 text-white hover:bg-sky-700 focus:ring-4 py-2 text-xl 
                                    font-medium  shadow-sm  focus:outline-none focus:ring-sky-500 focus:rin    g-offset-2
                                    disabled:bg-gray-300 disabled:text-slate-400
                                    "
                        style={{ minWidth: '110px' }}
                        // className="inline-flex justify-center items-center rounded-md border border-transparent bg-gray-400 py-2 px-4 text-lg  font-medium text-gray-900 shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => router.push({ pathname: '/apply/start' })}
                    > رجوع</button>
                </div>
                <div ref={componentRef}
                    style={{ width: '100%', backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', direction: 'rtl' }}>
                    <div >
                        <div className="flex flex-wrap px-8 items-center justify-between mx-auto md:grid md:grid-cols-3 md:gap-6 print-header">
                            <div className="flex md:col-span-1 print-grid">
                                <span className="self-center text-base md:text-xl font-semibold whitespace-nowrap dark:text-white">
                                    <p className="mb-3 font-light text-center">
                                        وزارة الداخلية <br />
                                        الاستعلامات الالكترونية <br />
                                    </p>
                                </span>
                            </div>
                            <div className="items-center justify-center md:flex md:w-auto md:order-1 md:col-span-1 print-grid print-title">
                                <Image className='w-20 h-20 md:w-24 md:h-24' src={profilePic} alt="MOI" />
                            </div>
                            <div className="items-center justify-end w-full md:flex md:w-auto md:order-1 md:col-span-1 print-grid print-title">
                                <span className="self-center text-base md:text-xl font-semibold whitespace-nowrap dark:text-white">
                                    <p className="mb-3 font-normal mt-[-20px] mr-[-8px] text-right md:font-bold md:mt-0 md:mr-0 md:text-center">
                                        استمارة الحجز الالكتروني
                                    </p>
                                </span>
                            </div>
                        </div>
                        <div style={{ width: '100%', borderTop: '1px solid', backgroundColor: 'white', height: '20px', display: 'flex', justifyContent: 'left', alignItems: 'center', textAlign: 'center' }}>
                        </div>
                        <div style={{ width: '100%', backgroundColor: 'white', display: 'flex', justifyContent: 'left', alignItems: 'center', textAlign: 'center', marginTop: '0' }}>
                            <div style={{ width: '100%', height: '50px', textAlign: 'center' }}>
                                <h3 style={{ fontWeight: 'bold', textDecoration: 'underline' }}>استمارة الحجز الالكتروني (الاونلاين) </h3>
                            </div>
                        </div>
                        <div style={{ backgroundColor: 'white' }}>
                            <div className="px-4 py-5 sm:py-3 sm:px-6 ">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                            الاسم الكامل
                                        </label>
                                        <input
                                            readOnly
                                            value={reservInfo?.fname + ' ' + reservInfo?.sname + ' ' + reservInfo?.lname + ' ' + reservInfo?.nickname}
                                            type="text"
                                            placeholder="الاسم الكامل"
                                            name="first-name"
                                            id="first-name"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                    <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                            أسم الام الكامل
                                        </label>
                                        <input
                                            readOnly
                                            value={reservInfo?.fmother + ' ' + reservInfo?.smother}
                                            type="text"
                                            placeholder="أسم الام الكامل "
                                            name="first-name"
                                            id="first-name"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                    <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                            رقم البطاقة الموحدة
                                        </label>
                                        <input
                                            readOnly
                                            value={reservInfo?.id_card}
                                            type="text"
                                            placeholder=" رقم البطاقة الموحدة"
                                            name="first-name"
                                            id="first-name"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                    <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                            رقم الهاتف
                                        </label>
                                        <input
                                            readOnly
                                            value={reservInfo?.phonenum}
                                            type="text"
                                            placeholder="رقم الهاتف"
                                            name="phone"
                                            id="phone"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                    <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                            تاريخ الحجز
                                        </label>
                                        <input
                                            readOnly
                                            value={reservInfo?.bookingdate ? dayjs(reservInfo?.bookingdate).format('YYYY-MM-DD') : null}
                                            type="text"
                                            placeholder="تاريخ الحجز"
                                            name="bookingdate"
                                            id="bookingdate"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                     <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                           توقيت الحجز
                                        </label>
                                        <input
                                            readOnly
                                            value={reservInfo?.bookinghours}
                                            type="text"
                                            placeholder="توقيت الحجز"
                                            name="first-name"
                                            id="first-name"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                     <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                            نوع الحجز
                                        </label>
                                        <input
                                            readOnly
                                            value={
                                                reservInfo?.reservation_cat == 1 ? 'حجز المركبات' :
                                                    reservInfo?.reservation_cat == 2 ? 'حجز اجازة السياقة' :
                                                        reservInfo?.reservation_cat == 3 ? 'حجز الدراجة النارية' : ''
                                            }

                                            type="text"
                                            placeholder="الصنف "
                                            name="cartype"
                                            id="cartype"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="py-3 px-6 ">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                            نوع المعاملة
                                        </label>
                                        <input
                                            readOnly
                                            value={reservInfo?.transtype}
                                            type="text"
                                            placeholder="نوع المعاملة"
                                            name="transtype"
                                            id="transtype"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                    {reservInfo?.contractno &&
                                        <div className="col-span-3 md:col-span-1 print-grid">
                                            <label className="mr-2 block text-sm font-medium text-gray-500">
                                                رقم العقد المروري
                                            </label>
                                            <input
                                                readOnly
                                                value={reservInfo?.contractno}
                                                type="text"
                                                placeholder="رقم العقد المروري"
                                                name="contractno"
                                                id="contractno"
                                                autoComplete="given-name"
                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                            />
                                        </div>}
                                    {dayjs(reservInfo?.contractexpire).format('YYYY-MM-DD') != '1900-01-01' &&
                                        <div className="col-span-3 md:col-span-1 print-grid">
                                            <label className="mr-2 block text-sm font-medium text-gray-500">
                                                تاريخ العقد المروري
                                            </label>
                                            <input
                                                readOnly
                                                value={reservInfo?.contractexpire ? dayjs(reservInfo?.contractexpire).format('YYYY-MM-DD') : null}
                                                type="text"
                                                placeholder="تاريخ العقد المروري"
                                                name="contractexpire"
                                                id="contractexpire"
                                                autoComplete="given-name"
                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                            />
                                        </div>}
                                </div>
                            </div>
                            {reservInfo?.reservation_cat != 2 &&
                                <div className="py-3 px-6 ">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-3 md:col-span-1 print-grid">
                                            <label className="mr-2 block text-sm font-medium text-gray-500">
                                                {reservInfo?.reservation_cat == 1 && 'صنف المركبة'}
                                                {reservInfo?.reservation_cat == 3 && 'صنف الدراجة'}
                                            </label>
                                            <input
                                                readOnly
                                                value={reservInfo?.cartype}
                                                type="text"
                                                placeholder="الصنف "
                                                name="cartype"
                                                id="cartype"
                                                autoComplete="given-name"
                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                            />
                                        </div>
                                        <div className="col-span-3 md:col-span-1 print-grid">
                                            <label className="mr-2 block text-sm font-medium text-gray-500">
                                                نوع الرقم
                                            </label>
                                            <input
                                                readOnly
                                                value={reservInfo?.carnumtype == 1 ? 'الرقم الحديث' : reservInfo?.carnumtype == 2 ? 'الرقم القديم' : ''}
                                                type="text"
                                                placeholder="نوع الرقم"
                                                name="carnumtype"
                                                id="carnumtype"
                                                autoComplete="given-name"
                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                            />
                                        </div>
                                        <div className="col-span-3 md:col-span-1 print-grid">
                                            <label className="mr-2 block text-sm font-medium text-gray-500">
                                                {reservInfo?.reservation_cat == 1 && 'رقم المركبة'}
                                                {reservInfo?.reservation_cat == 3 && 'رقم الدراجة'}
                                            </label>
                                            <input
                                                readOnly
                                                value={reservInfo?.carnum}
                                                type="text"
                                                placeholder="الرقم "
                                                name="carnum"
                                                id="carnum"
                                                autoComplete="given-name"
                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                            />
                                        </div>
                                    </div>
                                </div>}
                            <div className="py-3 px-6 ">
                                <div className="grid grid-cols-3 gap-2">
                                    {reservInfo?.reservation_cat != 2 &&
                                        <div className="col-span-3 md:col-span-1 print-grid">
                                            <label className="mr-2 block text-sm font-medium text-gray-500">
                                                الحرف
                                            </label>
                                            <input
                                                readOnly
                                                value={reservInfo?.arabic + '-' + reservInfo?.english}
                                                type="text"
                                                placeholder="الحرف"
                                                name="english"
                                                id="english"
                                                autoComplete="given-name"
                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                            />
                                        </div>}
                                    <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                            المحافظة
                                        </label>
                                        <input
                                            readOnly
                                            value={reservInfo?.gov + '-' + reservInfo?.govcode}
                                            type="text"
                                            placeholder="المحافظة"
                                            name="gov"
                                            id="gov"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                    <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                            موقع المراجعة
                                        </label>
                                        <input
                                            readOnly
                                            value={reservInfo?.sit}
                                            type="text"
                                            placeholder="موقع المراجعة"
                                            name="sit"
                                            id="sit"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* <div className="py-3 px-6 ">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-3 md:col-span-1 print-grid">
                                        <label className="mr-2 block text-sm font-medium text-gray-500">
                                            نوع الحجز
                                        </label>
                                        <input
                                            readOnly
                                            value={
                                                reservInfo?.reservation_cat == 1 ? 'حجز المركبات' :
                                                    reservInfo?.reservation_cat == 2 ? 'حجز اجازة السياقة' :
                                                        reservInfo?.reservation_cat == 3 ? 'حجز الدراجة النارية' : ''
                                            }

                                            type="text"
                                            placeholder="الصنف "
                                            name="cartype"
                                            id="cartype"
                                            autoComplete="given-name"
                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-md "
                                        />
                                    </div>
                                </div>
                            </div> */}
                        </div>
                        <div
                            className="block md:flex "
                            style={{ marginTop: '20px', width: '100%', backgroundColor: 'white', height: '150px', justifyContent: 'left', alignItems: 'center' }}>
                            <div style={{ width: '50%', height: '150px', marginTop: "60px" }}>
                                <div style={{ margin: "0 auto", maxWidth: 128, width: "300px", height: "auto", textAlign: "center" }}>
                                    <QRCode
                                        size={240}
                                        style={{ width: "210px", height: "210px" }}
                                        value={reservInfo?.nanoid || '0'}
                                        viewBox="0 0 240 240"
                                    />
                                    {/* Display nanoid below QR code */}
                                    <p style={{ marginTop: "12px", fontSize: "20px", color: "#333", fontWeight: "bold" }}>
                                        {reservInfo?.nanoid}
                                    </p>
                                </div>
                            </div>

                        </div>
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                            <h3 style={{ fontWeight: 'bold' }}>جميع الحقوق محفوظة لمديرية الاتصالات والنظم المعلوماتية - {dayjs().format('YYYY')}</h3>
                        </div>
                    </div>
                </div>
                {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'end' }}>
                    <h3 style={{ fontWeight: 'bold' }}>جميع الحقوق محفوظة لمديرية الاتصالات والنظم المعلوماتية - 2024</h3>
                </div> */}
                <br />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'end', marginBottom: '20px' }}>

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

                    {/* <Button variant="contained" startIcon={<Print />} onClick={handlePrint}> طباعة الاستمارة </Button> */}
                </div>

                {/* <div className=" flex flex-col justify-centers h-screen items-center ">
                    <div className="rounded bg-gradient-to-r bg-slate-400 via-green-500 to-blue-500 p-1 my-32 ">
                        <div className="flex flex-col items-center space-y-2 bg-white p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-28 w-28 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-3xl text-transparent">عزيزي المواطن</h1>
                            <p className="text-center"> تم تثبيت طلب الحجز بنجاح بامكانك مراجعة الاستعلامات الالكترونية في الموعد المطلوب</p>
                            <div className="col-span-5 sm:col-span-1">
                                <p className="text-center text-lg font-bold">رقم الطلب :{decrypt(reqInfo?.nanoid)}</p>
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
                                    onClick={() => router.push({ pathname: '/apply/start' })}
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
                                    onClick={() => router.push({ pathname: '/apply/start' })}
                                > عودة الى الرئيسية</button>
                            </div >
                        </div>
                    </div>
                </div> */}
            </>
        )
    )
}