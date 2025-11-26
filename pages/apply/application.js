import React, { useState, useEffect, useCallback, useRef, useContext } from "react"
import Select from 'react-select';
import dayjs from 'dayjs'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/router";
import AppContext from "/context/appContext";

const CAPTCHA_EXPIRY_TIME = 300; // CAPTCHA expiry time in seconds

export default function Application() {
    const router = useRouter()

    //Ayham captcha ***************************************************
    const [countdown, setCountdown] = useState(CAPTCHA_EXPIRY_TIME); // State to track countdown
    const intervalRef = useRef(null);
    const [inValue, setInValue] = useState(null)
    const didRequestRef = useRef(false);
    const [inputValue, setInputValue] = useState('');
    const [distinationOnline, setDistinationOnline] = useState([])
    const [ValidError, setValidError] = useState(false)
    const [distination, setDistination] = useState([])
    console.log('distination', distination);
    const [vehicle_reservations, setVehicle_reservations] = useState([{
        car_category_id: '',
        carnumtype: '',
        carnum: '',
        characternum: '',
        gover_id: '',
    }])
    // context data
    const { updateReqInfo, showLoading, step, setStep } = useContext(AppContext)

    const [escorts, setEscorts] = useState([
        {
            escort_id: '',             // UUID (optional in frontend, backend will generate)
            reception_record_id: '',   // link to the parent record (reception)

            exname1: '',
            exname2: '',
            exname3: '',
            exname4: '',

            exsname: '',

            exmname1: '',
            exmname2: '',
            exmname3: '',

            exbrithdate: '',           // format: 'YYYY-MM-DD' (ISO string or Date object)
            exid_card: '',             // up to 14 digits
            exphonenum: '',            // 11 digits, starting with 0
            exvistor_org: ''
        }
    ]);

    // body data
    const [dataBody, SetdataBody] = useState({
        reception_record_id: '',         // uuid
        name1: '',
        name2: '',
        name3: '',
        name4: '',
        surname: '',
        mname1: '',
        mname2: '',
        mname3: '',
        mname4: '',
        msurname: '',
        identitynum: '',                 // consider string if user types it
        phone: '',                       // consider string to preserve leading zeros
        district: '',
        street: '',
        region: '',
        purpose: '',
        job_cat: '',
        province_id: '',
        notes: '',
        house: '',
        destination_org_id: '',
    });

    const distination_org = useCallback(async () => {
        try {
            let response = await fetch('../api/distinationtransform')
            const jsonData = await response.json();
            setDistinationOnline(jsonData.data)

            setNotificationsData(jsonData['data'][0])
        } catch (err) {
            console.error(err)
        }
    }, [])

    const payload = { escorts, dataBody, vehicle_reservations }

    console.log('payload', payload);


    const addData = (async () => {
        try {
            const payload = { escorts, dataBody, inputValue, vehicle_reservations }
            const response = await fetch('../api/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const jsonData = await response.json();

            if (jsonData.success) {
                console.log('Insert success, ID:', jsonData.reception_record_id);
                // Use data or show notifications as needed:
                setDistinationOnline(jsonData.data); // Adjust this according to your response
                setNotificationsData(jsonData.data?.[0]);
            } else {
                console.error('Insert failed:', jsonData.message);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    });



    console.log('distinationOnline', distinationOnline);

    const handleChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        let fetchedSuggestions = distinationOnline.filter(suggestion =>

            suggestion.f_unit_name.includes(value ? value : null)
        );
        setSuggestions(fetchedSuggestions);
    };

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion);

        setSuggestions([]);
    };

    useEffect(() => { distination_org() }, [])
    const [suggestions, setSuggestions] = useState([]);


    // get notes
    const [notificationsData, setNotificationsData] = useState()
    const get_notification = useCallback(async () => {
        try {
            let response = await fetch('../api/get_notification')
            const jsonData = await response.json();
            setNotificationsData(jsonData['data'][0])
        } catch (err) {
            console.error(err)
        }
    }, [])
    // console.log('notificationsData',notificationsData);

    const [notificationsData1, setNotificationsData1] = useState()
    const get_notification1 = useCallback(async () => {
        try {
            let response = await fetch('../api/get_notification')
            const jsonData = await response.json();
            setNotificationsData1(jsonData['data'][1])
        } catch (err) {
            console.error(err)
        }
    }, [])
    const [notificationsData2, setNotificationsData2] = useState()
    const get_notification2 = useCallback(async () => {
        try {
            let response = await fetch('../api/get_notification')
            const jsonData = await response.json();
            setNotificationsData2(jsonData['data'][2])
        } catch (err) {
            console.error(err)
        }
    }, [])
    // check validation function
    const checkValidation = () => {
        if (dataBody.reservation_cat == 2) {
            if (dataBody?.fname && dataBody?.sname && dataBody?.lname && dataBody?.nickname && dataBody?.fmother && dataBody?.smother && dataBody?.id_card &&
                dataBody?.phonenum && dataBody?.goverID &&
                dataBody?.transID && dataBody?.reviewID && dataBody?.bookingdate && dataBody?.bookinghours && ReservIndicator) {
                // setValidation(true)
                // getCaptchaData(dataBody?.phonenum)
                return true
            } else {
                return false
            }
        } else {
            if (dataBody?.fname && dataBody?.sname && dataBody?.lname && dataBody?.nickname && dataBody?.fmother && dataBody?.smother && dataBody?.id_card &&
                dataBody?.phonenum && dataBody?.carnum && dataBody?.goverID &&
                dataBody?.transID && dataBody?.reviewID && dataBody?.bookingdate && dataBody.car_category_id && dataBody?.chasis_no && dataBody?.bookinghours &&
                // dataBody?.contractno && dataBody.contractexpire && contractnIndecitor && 
                ReservIndicator) {
                // getCaptchaData(dataBody?.phonenum)
                return true
            } else {
                return false
            }
        }
    }

    // Captcha vars**********************************************
    const [captchaImg, setCaptchaImg] = useState()
    const [captchaQuestion, setCaptchaQuestion] = useState()
    const [captchaToken, setCaptchaToken] = useState()
    const getCaptchaData = useCallback(async (phoneNo) => {
        try {
            let response = await fetch(`../api/get_captcha?phone_no=${phoneNo}`);
            const jsonData = await response.json();
            const data = jsonData['data'];
            if (jsonData["success"] === true) {
                setValidError(false)
                setCaptchaImg(data?.captchaImage);
                setCaptchaQuestion(data?.captchaQuestion);
                setCaptchaToken(data?.token);
            } else {
                if (jsonData["error"]?.validErr === true) {
                    setValidError(true)
                    console.log("Too many");
                } else {
                    setValidError(false)
                }
            }


        } catch (err) {
            console.error(err);
        }
    }, []);

    // Function to handle countdown logic
    useEffect(() => {
        let count = CAPTCHA_EXPIRY_TIME

        // Trigger the CAPTCHA logic only when phonenum is valid and available
        if (checkValidation()) {
            // console.log("call first");
            // Clear any existing interval before starting a new one
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            // Fetch the CAPTCHA immediately after validation
            if (didRequestRef.current == false) {
                didRequestRef.current = true
                getCaptchaData(dataBody.phonenum);
            }

            // Set the interval and start the countdown
            intervalRef.current = setInterval(() => {

                if (count > 1) {
                    count = count - 1
                    setCountdown(count)
                } else {
                    if (checkValidation()) {
                        getCaptchaData(dataBody.phonenum);
                        count = CAPTCHA_EXPIRY_TIME
                        setCountdown(CAPTCHA_EXPIRY_TIME)
                    }
                }
                // console.log("call end");
                // console.log("dataBody.phonenum", dataBody.phonenum);
                // console.log("step", step);
                // console.log("checkValidation", checkValidation());
            }, 1000);

            // Cleanup function to clear interval when component unmounts
            return () => {
                clearInterval(window.captchaInterval);
                window.captchaInterval = null;
            };
            // Cleanup on unmount or before setting a new interval
            // return () => clearInterval(intervalRef.current);
        }
    }, [dataBody]);

    // useEffect(() => {
    //     // let count = CAPTCHA_EXPIRY_TIME

    //     // Trigger the CAPTCHA logic only when phonenum is valid and available
    //     if (checkValidation()) {
    //         console.log("call first");
    //         if (!didRequestRef.current) {
    //             didRequestRef.current = true;
    //             getCaptchaData(dataBody.phonenum);
    //             setCountdown(CAPTCHA_EXPIRY_TIME)
    //             // Clear any existing interval before starting a new one
    //             if (intervalRef.current) {
    //                 clearInterval(intervalRef.current);
    //             }

    //             // Set the interval and start the countdown
    //             intervalRef.current = setInterval(() => {
    //                 setCountdown(prev => {
    //                     if (prev === 1) {
    //                         getCaptchaData(dataBody.phonenum);
    //                         return CAPTCHA_EXPIRY_TIME;
    //                     }
    //                     return prev - 1;
    //                 });
    //                 // if (count > 1) {
    //                 //     count = count - 1
    //                 //     setCountdown(count)
    //                 // } else {
    //                 //     if (checkValidation()) {
    //                 //         getCaptchaData(dataBody.phonenum);
    //                 //         count = CAPTCHA_EXPIRY_TIME
    //                 //         setCountdown(CAPTCHA_EXPIRY_TIME)
    //                 //     }
    //                 // }
    //                 // console.log("call end");
    //                 // console.log("dataBody.phonenum", dataBody.phonenum);
    //                 // console.log("step", step);
    //                 // console.log("checkValidation", checkValidation());
    //             }, 1000);
    //         }
    //         // Cleanup function to clear interval when component unmounts
    //         return () => {
    //             clearInterval(window.captchaInterval);
    //             didRequestRef.current = false;
    //         };
    //         // Cleanup on unmount or before setting a new interval
    //         // return () => clearInterval(intervalRef.current);
    //     }
    //     // Cleanup if phone/step not valid
    //     return () => {
    //         if (intervalRef.current) clearInterval(intervalRef.current);
    //         didRequestRef.current = false;
    //     };
    // }, [dataBody]);

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
        // updateCaptchaData(captchaEncID, dataBody.phonenum)
    };

    const [reviewID, setReviewID] = useState(0)
    const [contractnIndecitor, setContractnIndecitor] = useState(false);
    const [ReservIndicator, setReservIndicator] = useState(false);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // get dates (max, min)
    const [datesValues, setDatesValues] = useState()
    const getDates = useCallback(async (e) => {
        try {
            // console.log("getServerSideProps",await getServerSideProps(""));
            let response = await fetch('../api/get_dates')
            const jsonData = await response.json()
            setDatesValues(jsonData['data'])
        } catch (err) {
            console.error(err)
        }
    }, [])

    // const [numTypeSeclect, setNumTypeSeclect] = useState({ label: 'الرقم الحديث', value: 1 })
    const [resCatSeclect, setResCatSeclect] = useState({ label: 'حجز المركبات', value: 1 })

    const [letterTypes, setletterTypes] = useState([])
    // const [letterTypesSelect, setletterTypesSelect] = useState()
    const getletterTypes = useCallback(async () => {
        try {
            let response = await fetch('../api/lettertype')
            const jsonData = await response.json();
            setletterTypes(jsonData['data'].map(l => ({ ...l, label: l.arabic + ' - ' + l.english, value: l.id })))
        } catch (err) {
            console.error(err)
        }
    }, [])
    const [bookingHours, setbookingHours] = useState([]);
    const [bookingHoursSelect, setbookingHoursSelect] = useState();

    const getbookingHours = useCallback(async (reviewid) => {
        try {
            const response = await fetch(`/api/bookinghours?reviewid=${reviewid}`);
            const jsonData = await response.json();
            console.log('jsonData', jsonData);

            if (jsonData.success) {
                setbookingHours(jsonData.data[0].bookinghours.map(l => ({
                    id: l.id,
                    label: l.value, // هذا يعرض للمستخدم
                    value: l.id      // هذا هو ما يتم تخزينه عند الاختيار
                })));
            } else {
                console.error('API Error:', jsonData.message);
            }
        } catch (err) {
            console.error('Fetch Error:', err);
        }
    }, []);



    const [governsSelect, setGovernsSelect] = useState()
    const [governs, setGoverns] = useState([])
    const getGoverns = useCallback(async () => {
        try {
            let response = await fetch('../api/governs')
            const jsonData = await response.json();
            setGoverns(jsonData['data'].map(p => ({ ...p, label: p.value + ' - ' + p.code, value: p.id })))
        } catch (err) {
            console.error(err)
        }
    }, [])

    const [categorySelect, setcategorySelect] = useState()
    const [categoryTypes, setcategoryTypes] = useState([])
    const getCategoryTypes = useCallback(async (resCat = 1) => {
        try {
            let response = await fetch('../api/car_category')
            const jsonData = await response.json();
            // console.log("cat",jsonData);

            let catData = jsonData?.data.filter((c) => { return c?.reservation_cat == resCat })
            setcategoryTypes(catData?.map(c => (
                { ...c, label: c.value, value: c.id }
            )))
        } catch (err) {
            console.error(err)
        }
    }, [])

    const Accountresinfobydatefn = async (reviewID, phonenum, carnum, reservDate) => {

        try {
            let response = await fetch(`../api/check_reservation?reviewID=${reviewID}&phonenum=${phonenum}&carnum=${carnum}&reservDate=${reservDate}&reservationCat=${dataBody.reservation_cat}&chasis_no=${dataBody.chasis_no}`)
            const jsonData = await response.json();
            return jsonData['data']?.checkReserv
        } catch (err) {
            console.error(err)
            return false
        }
    }
    const Checkhours = async (reviewID, bookingdate, bookinghours, reservation_cat) => {

        try {
            let response = await fetch(`../api/checkhours?reviewid=${reviewID}&bookingdate=${bookingdate}&bookinghours=${bookinghours}&reservationCat=${reservation_cat}`)
            const jsonData = await response.json();
            return jsonData['data']
        } catch (err) {
            console.error(err)
            return false
        }
    }

    const [transationtype, setTransationtype] = useState([])
    const [transationtypeSelect, setTransationtypeSelect] = useState()
    const getTransationtype = useCallback(async () => {
        try {
            let response = await fetch('../api/transationtype')
            const jsonData = await response.json();
            setTransationtype(jsonData['data'].map(a => ({ ...a, label: a.value, value: a.id })))
        } catch (err) {
            console.error(err)
        }
    }, [])

    const [reviewsit, setReviewsit] = useState([])
    const [reviewsitSelect, setReviewsitSelect] = useState()
    const [revCnCate, setRevCnCat] = useState([])

    const getSiteFilterLocation = async (transID) => {
        try {
            let catCarOrMotorUrl = dataBody.characternum ?
                `../api/site_filter?carLetterID=${dataBody.characternum}&carCatID=${dataBody.car_category_id}&carNumID=${dataBody.carnumtype}&reservationCat=${dataBody?.reservation_cat}` :
                `../api/site_filter?carCatID=${dataBody.car_category_id}&carNumID=${dataBody.carnumtype}&reservationCat=${dataBody?.reservation_cat}`
            let catLicenseUrl = `../api/site_filter?reservationCat=${dataBody?.reservation_cat}&transID=${transID}`

            let url = dataBody?.reservation_cat == 2 ? catLicenseUrl : catCarOrMotorUrl
            let response = await fetch(url)
            const jsonData = await response.json();
            setRevCnCat(jsonData['data'])
            setReviewsit(jsonData['data'].map(a => ({ ...a, label: a.value, value: a.id })))
        } catch (err) {
            console.error(err)
        }
    }

    const getTransactionFromSite = (siteID) => {
        let reviewData = revCnCate.find(item => item.id == siteID)
        let transationTypeArr = dataBody?.reservation_cat == 1 ? reviewData?.transationtypearray : dataBody?.reservation_cat == 3 ? reviewData?.transtiontypearraymotor : []
        let checkArr = Array.isArray(transationTypeArr)
        if (checkArr == false) {
            setTransationtype([])
        } else {
            setTransationtype(transationTypeArr.map(a => ({ ...a, label: a.value, value: a.id })))
        }
    }

    const [firstVisit, setFirstVisit] = useState()
    const getFirstVisit = (siteID) => {

        let reviewData = revCnCate.find(item => item.id == siteID)
        let numCate = reviewData?.numcategoryarray


        let checkArr = Array.isArray(numCate)
        if (checkArr == false) {
            return false
        } else {
            const findW = numCate?.find(item => item.id == 1)
            const findM = numCate?.find(item => item.id == 2)

            if (findW && findM) {
                setFirstVisit(3)
                return 3
            }
            if (findW) {
                setFirstVisit(1)
                return 1
            }

            if (findM) {
                setFirstVisit(2)
                return 2
            }
        }
    }

    useEffect(() => {
        getDates()
        getCategoryTypes()
        // getGenderTypes()
        getGoverns()
        getletterTypes()
        // getTransationtype()
        // getReviewsit()F
        get_notification()
        get_notification1()
        get_notification2()
    }, [getDates, getGoverns, getletterTypes, getCategoryTypes, get_notification, get_notification1, get_notification2])

    const handleSaveInfo = async (e, inputValue) => {
        showLoading(true)
        var checkValidationVar = true
        for (const key in dataBody) {
            // if (dataBody[key] == null || dataBody[key] == '' || dataBody[key] == undefined) {
            // for (const key in dataBody) {
            if (Object.prototype.hasOwnProperty.call(dataBody, key)) {
                if (dataBody[key] == null || dataBody[key] == '' || dataBody[key] == undefined) {
                    // checkValidation = false
                    if (key !== 'contractno' && key !== 'contractexpire' && key !== 'carnum') {
                        checkValidationVar = false
                    }
                }
            } else {
                checkValidationVar = false
            }
        }
        // }

        if (
            checkValidation() == true
        ) {

            try {

                // const tokenE = await getAsyJWEToken(inputValue)
                let url = '../api/reservation_information'
                let method = 'POST'
                let headers = {
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                }
                let body = JSON.stringify({ ...dataBody, captchaToken: captchaToken, captchaCode: inValue })
                // console.log("body", body)
                let response = await fetch(url, { method, headers, body })
                let jsonData = await response.json()
                // console.log("jsonData", jsonData)
                if (jsonData['success'] === false) {
                    showLoading(false)
                    if (jsonData['error']?.errCaptcha === true) {
                        return toast.error('يرجى التأكد من معلومات التحقق، اعد المحاولة', {
                            position: "bottom-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        });
                    } else {
                        return toast.error('خطأ في ارسال الطلب ', {
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

                } else if (jsonData['success'] === true) {
                    // console.log("id: ", data.id);
                    showLoading(false)
                    // setSubmite(true)
                    clearInterval(intervalRef.current);
                    toast.success('تم ارسال الطلب بنجاح !', {
                        position: "bottom-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    })
                    // console.log("data",jsonData['data']);
                    updateReqInfo(
                        jsonData['data']?.v1 // v1 = nanoid
                        , dataBody.phonenum
                        , dataBody.bookingdate
                    )
                    SetdataBody({
                        name1: '',
                        name2: '',
                        name3: '',
                        name4: '',
                        surname: '',
                        mname1: '',
                        mname2: '',
                        mname3: '',
                        mname4: '',
                        msurname: '',
                        identitynum: '',
                        phone: '',
                        district: '',
                        street: '',
                        region: '',
                        purpose: '',
                        job_cat: '',
                        province_id: '',
                        notes: '',
                        house: '',
                        destination_org_id: '',
                        created_at: '' // optional, usually set by backend
                    });

                    // setCountdown(0)
                    // setReactCaptcha(null)
                    // setRender(false)
                    sleep(2000).then(() => {
                        setStep(2);
                        router.push({
                            pathname: '/apply/verify'
                        })
                    })
                    return
                }

            } catch (error) {
                showLoading(false)
                console.log("catch error", {
                    error: error
                })
                toast.error('خطأ في الشبكة  ', {
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
        } else {
            showLoading(false)
            toast.error('أملا جميع الحقول المطلوبة', {
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
        // }
    }


    console.log('escorts', escorts);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // const checkCaptcha = inputCaptcha()
        // if (checkCaptcha == false) {
        //     return toast.error('يرجى التأكد من رمز التحقق، اعد المحاولة', {
        //         position: "bottom-center",
        //         autoClose: 5000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         theme: "light",
        //     });
        // }

        addData()
        // const inputValue = intervalRef.current.value
        // handleSaveInfo(e, inputValue)
    }

    // =============== validation
    const Msg = (txt) => {
        toast.error(txt, {
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

    // check phone validation
    const numberValid = (value) => {
        if (!isNaN(value)) {
            return true
        }
    }

    // check phone validation
    const pohoneValid = (value) => {
        const strVal = String(value).trim();

        if (!/^\d*$/.test(strVal)) {
            Msg('الرجاء ادخال أرقام فقط');
            return false;
        }

        if (strVal.length < 11) {
            // Don’t validate yet, still typing
            return true;
        }

        if (strVal.length > 11) {
            Msg('رقم الموبايل يجب أن لا يزيد عن 11 رقمًا');
            return false;
        }

        if (!/^7[5789]/.test(strVal)) {
            Msg('الرجاء التاكد من رقم الموبايل، يجب أن يبدأ بـ 07 ثم أحد الأرقام 7 أو 8 أو 9 أو 5');
            return false;
        }

        return true;
    };



    // check arabic text validation
    const AtxtValid = (value, msg) => {
        console.log('value', value);

        // const isValidInput = /^[\u0600-\u06FF\s]+$/.test(value); //  عربي
        const isValidInput = /^[\u0621-\u064A\s]+$/u.test(value);

        if (isValidInput) {
            return true
        } else {
            // setInputValue(value.slice(0, -1));
            Msg('الرجاء التاكد من' + ' ' + msg);
            return false
        }
    }



    useEffect(() => {
        if (step != 1) {
            setStep(0);
            router.push('/apply/start')
        }
    }, [])


    console.log('vehicle_reservations', vehicle_reservations);

    return (
        (step === 1 &&
            <>
                <div>
                    <h3 className="text-center font-bold text-2xl mt-5">طلب حجز الكتروني</h3>
                </div>
                <div className={` sm:rounded-md my-6 shadow lg:mx-20 md:mx-20 `}
                    style={{ backgroundColor: "rgb(242, 243, 245)" }}
                >

                    <div className="md:grid md:grid-cols-4 md:gap-2">
                        {/* <div className="  md:col-span-2 ">
                            <div className="px-4 sm:px-0">
                                <h3 className="text-lg font-medium leading-6 text-gray-900 m-3 ">معلومات مقدم الطلب</h3>
                            </div>
                        </div> */}

                        <div className="mt-2 md:col-span-4 md:mt-0">

                            <form action="#" method="POST" >

                                <div className=" sm:rounded-md">
                                    <div style={{ backgroundColor: "rgb(51 103 145 / 85%)" }} className="w-full rounded-md p-1 mb-4">
                                        <h3 className="text-xl text-center font-bold leading-6 text-gray-50 m-3 ">القسم المعني بالزيارة</h3>
                                    </div>
                                    <div className="px-3 py-3 sm:py-12 sm:px-12">
                                        <div className="grid grid-cols-12">
                                            <div className="col-span-12">
                                                <input
                                                    type="text"
                                                    value={inputValue.unit_name}
                                                    onChange={handleChange}
                                                    placeholder="الدائرة التي ترغب بمراجعتها"
                                                    className="w-full border border-gray-300 rounded px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />

                                                {suggestions.length > 0 && (
                                                    <ul className="mt-2 bg-gray-100 border border-gray-300 rounded shadow p-2">
                                                        {suggestions.map((suggestion, index) => (
                                                            <li
                                                                key={index}
                                                                className="cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                            >
                                                                {index + 1}- {suggestion.f_unit_name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: "rgb(51 103 145 / 85%)" }} className="w-full rounded-md p-1 mb-4">
                                        <h3 className="text-xl text-center font-bold leading-6 text-gray-50 m-3 ">البيانات الشخصية</h3>
                                    </div>
                                    <div className="px-4 py-5 sm:py-3 sm:px-6 ">
                                        <div className="grid grid-cols-5 gap-2">
                                            <div className="col-span-12 md:col-span-1">
                                                <input
                                                    // disabled={reqdisable}
                                                    value={dataBody?.name1 || ''}
                                                    required
                                                    maxLength={15}
                                                    pattern='^[\u0600-\u06FF\s]+$'
                                                    // pattern= "/^[\u0600-\u06FF\s]+$/" 
                                                    title="الرجاء ادخال الاسم باللغة العربية"
                                                    // onInvalid="setCustomValidity('Please enter at least 5 characters')"
                                                    onChange={e => { SetdataBody({ ...dataBody, name1: AtxtValid(e.target.value, "الاسم") == true ? e.target.value : '' }) }}
                                                    type="text"
                                                    placeholder="الاسم"
                                                    name="first-name"
                                                    id="first-name"
                                                    autoComplete="given-name"
                                                    className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm "
                                                />
                                            </div>

                                            <div className="col-span-5 md:col-span-1">
                                                <input
                                                    // disabled={reqdisable}
                                                    value={dataBody?.name2 || ''}
                                                    required
                                                    maxLength={15}
                                                    pattern='^[\u0600-\u06FF\s]+$'
                                                    title="الرجاء ادخال الاسم باللغة العربية"
                                                    // onChange={e => setreqname2(e.target.value)}
                                                    onChange={e => { SetdataBody({ ...dataBody, name2: AtxtValid(e.target.value, "اسم الاب") == true ? e.target.value : '' }) }}
                                                    type="text"
                                                    // onChange={handleInputChange}
                                                    placeholder="اسم الاب"
                                                    name="first-name"
                                                    id="first-name"
                                                    autoComplete="given-name"
                                                    className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="col-span-5 md:col-span-1">
                                                <input
                                                    // disabled={reqdisable}
                                                    value={dataBody?.name3 || ''}
                                                    required
                                                    maxLength={15}
                                                    pattern='^[\u0600-\u06FF\s]+$'
                                                    title="الرجاء ادخال الاسم باللغة العربية"
                                                    onChange={e => { SetdataBody({ ...dataBody, name3: AtxtValid(e.target.value, "اسم الجد") == true ? e.target.value : '' }) }}
                                                    type="text"
                                                    placeholder="اسم الجد"
                                                    name="first-name"
                                                    id="first-name"
                                                    autoComplete="given-name"
                                                    className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="col-span-5 md:col-span-1">
                                                <input
                                                    // disabled={reqdisable}
                                                    value={dataBody?.surname || ''}
                                                    required
                                                    maxLength={15}
                                                    pattern='^[\u0600-\u06FF\s]+$'
                                                    onChange={e => { SetdataBody({ ...dataBody, surname: AtxtValid(e.target.value, "اللقب") == true ? e.target.value : '' }) }}
                                                    title="الرجاء ادخال اللقب باللغة العربية"
                                                    type="text"
                                                    placeholder="اللقب"
                                                    name="first-name"
                                                    id="first-name"
                                                    autoComplete="given-name"
                                                    className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="col-span-5 md:col-span-1">
                                                <label className="mr-2 block text-sm font-medium text-gray-700">
                                                    الموالبد
                                                </label>
                                                <input
                                                    // disabled={reqdisable}
                                                    value={dataBody?.brithdate || ''}
                                                    onChange={e => {
                                                        const selectedDate = dayjs(e.target.value, 'YYYY-MM-DD', true);
                                                        SetdataBody({
                                                            ...dataBody,
                                                            brithdate: selectedDate.format('YYYY-MM-DD')
                                                        });
                                                        setContractnIndecitor(true);

                                                        // const selectedDate = dayjs(e.target.value, 'YYYY-MM-DD', true);
                                                        // const today = dayjs();
                                                        // const diffDays = today.diff(selectedDate, 'day');
                                                        // // تحقق من كون التاريخ صالحًا، ولديه فرق أقل من 30 يومًا، وليس يوم الجمعة
                                                        // if (selectedDate.isValid() && diffDays <= 30) {
                                                        //     SetdataBody({
                                                        //         ...dataBody,
                                                        //         brithdate: selectedDate.format('YYYY-MM-DD')
                                                        //     });
                                                        //     setContractnIndecitor(true);
                                                        // } else {
                                                        //     SetdataBody({
                                                        //         ...dataBody,
                                                        //         brithdate: null
                                                        //     });
                                                        //     setContractnIndecitor(false)
                                                        //     Msg("العقد المروري منتهي الصلاحية");
                                                        // }
                                                    }
                                                    }
                                                    date
                                                    // required
                                                    type="date"
                                                    placeholder=""
                                                    name="contid"
                                                    // min={lastMonth}
                                                    // max={maxDate}
                                                    // autoComplete="given-name"
                                                    className="mt-1   block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                    <div className=" px-4 py-5 sm:py-3 sm:px-6">
                                        <div className="grid grid-cols-5 gap-2">
                                            <div className="col-span-5 md:col-span-1">
                                                <input
                                                    // disabled={reqdisable}
                                                    value={dataBody?.mname1 || ''}
                                                    required
                                                    maxLength={15}
                                                    pattern='^[\u0600-\u06FF\s]+$'
                                                    onChange={e => { SetdataBody({ ...dataBody, mname1: AtxtValid(e.target.value, "أسم الام ") == true ? e.target.value : '' }) }}
                                                    title="الرجاء ادخال أسم الام  باللغة العربية"
                                                    type="text"
                                                    placeholder="أسم الام "
                                                    name="first-name"
                                                    id="first-name"
                                                    autoComplete="given-name"
                                                    className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="col-span-5 md:col-span-1">
                                                <input
                                                    // disabled={reqdisable}
                                                    value={dataBody?.mname2 || ''}
                                                    required
                                                    maxLength={15}
                                                    pattern='^[\u0600-\u06FF\s]+$'
                                                    onChange={e => { SetdataBody({ ...dataBody, mname2: AtxtValid(e.target.value, "أسم أب الام ") == true ? e.target.value : '' }) }}
                                                    title="الرجاء ادخال أسم أب الام  باللغة العربية"
                                                    type="text"
                                                    placeholder="أسم أب الام "
                                                    name="first-name"
                                                    id="first-name"
                                                    autoComplete="given-name"
                                                    className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="col-span-5 md:col-span-1">
                                                <input
                                                    value={dataBody?.identitynum || ''}
                                                    required
                                                    maxLength={14}
                                                    pattern="^\d{14}$"
                                                    inputMode="numeric"
                                                    onChange={e => {
                                                        const val = e.target.value;

                                                        // فقط أرقام وطول لا يزيد عن 14
                                                        if (/^\d{0,12}$/.test(val)) {
                                                            // إذا تم إدخال 4 أرقام أو أكثر، تحقق من السنة
                                                            if (val.length >= 4) {
                                                                const year = parseInt(val.slice(0, 4), 10);
                                                                if (year >= 1900 && year <= 2099) {
                                                                    SetdataBody({ ...dataBody, identitynum: val });
                                                                }
                                                            } else {
                                                                // أقل من 4 أرقام → نسمح بالإدخال بدون تحقق السنة
                                                                SetdataBody({ ...dataBody, identitynum: val });
                                                            }
                                                        }
                                                    }}

                                                    title="الرجاء إدخال رقم البطاقة الموحدة المكون من 14 رقمًا"
                                                    type="text"
                                                    placeholder="رقم البطاقة الموحدة"
                                                    name="id-card"
                                                    id="id-card"
                                                    autoComplete="off"
                                                    className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                />

                                            </div>
                                            <div className="col-span-5 md:col-span-1">
                                                {/* <label className="mr-2 block text-sm font-medium text-gray-700">
                                                    رقم الموبايل
                                                </label> */}
                                                <input
                                                    value={dataBody?.phone || ''}
                                                    required
                                                    maxLength={11}
                                                    minLength={11}
                                                    pattern="[0][0-9]{10}"
                                                    title="الرجاء ادخال رقم الموبايل (11 رقم)"
                                                    // disabled={reqdisable}
                                                    onChange={e => { pohoneValid(e.target.value) == true && SetdataBody({ ...dataBody, phone: e.target.value, bookingdate: null }) }}
                                                    type="text"
                                                    placeholder="رقم الموبايل"
                                                    name="first-name"
                                                    id="first-name"
                                                    autoComplete="given-name"
                                                    className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="col-span-5 md:col-span-1">
                                                <input
                                                    // disabled={reqdisable}
                                                    value={dataBody?.vistor_org || ''}
                                                    required
                                                    maxLength={15}
                                                    pattern='^[\u0600-\u06FF\s]+$'
                                                    onChange={e => { SetdataBody({ ...dataBody, vistor_org: AtxtValid(e.target.value, "اللقب") == true ? e.target.value : '' }) }}
                                                    title="الرجاء ادخال جهة الانتساب"
                                                    type="text"
                                                    placeholder="جهة الانتساب"
                                                    name="badge"
                                                    id="badge"
                                                    autoComplete="given-name"
                                                    className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: "rgb(51 103 145 / 85%)" }} className="w-full rounded-md p-1 my-4">
                                        <h3 className="text-xl text-center font-bold leading-6 text-gray-50 m-3 "
                                        >
                                            {`معلومات المركبة
                                            `}
                                        </h3>
                                    </div>
                                    {/* cars or motors */}


                                    {vehicle_reservations.map((item, index) => {
                                        return (<>
                                            <div className=" px-4 py-5 sm:py-3 sm:px-6">
                                                <div className="grid grid-cols-5 gap-2">
                                                    <div className="col-span-5 md:col-span-1">
                                                        {/* <label className="mr-2 block text-sm font-medium text-gray-700">
                                                    صنف المركبة
                                                </label> */}


                                                        <div className="col-span-5 md:col-span-1">
                                                            <input
                                                                // disabled={reqdisable}
                                                                value={item?.car_category_id || ''}
                                                                required
                                                                maxLength={15}
                                                                // pattern='^[\u0600-\u06FF\s]+$'
                                                                pattern="/^[\u0600-\u06FF\s]+$/"
                                                                title="الرجاء ادخال الاسم باللغة العربية"
                                                                // onInvalid="setCustomValidity('Please enter at least 5 characters')"
                                                                onChange={e => {
                                                                    {
                                                                        setVehicle_reservations((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], car_category_id: e.target.value }
                                                                            return update;


                                                                        })
                                                                    }
                                                                }

                                                                }
                                                                type="text"
                                                                placeholder="المركبة"
                                                                name="first-name"
                                                                id="first-name"
                                                                // autoComplete="given-name"
                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm "
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="col-span-5 md:col-span-1">
                                                        {/* <label className="mr-2 block text-sm font-medium text-gray-700">
                                                    نوع الرقم
                                                </label> */}

                                                        <Select
                                                            isClearable
                                                            required
                                                            isSearchable
                                                            // isDisabled={dataBody.carnumtype != 1}
                                                            // defaultInputValue=""
                                                            value={item.carnumtype}
                                                            placeholder="اختر نوع الرقم"
                                                            options={[
                                                                { label: 'الرقم الحديث', value: 1 },
                                                                { label: 'الرقم القديم', value: 2 }
                                                            ]}

                                                            onChange={e => {
                                                                {
                                                                    setVehicle_reservations((old) => {
                                                                        const update = [...old]


                                                                        update[index] = { ...update[index], carnumtype: e }
                                                                        return update;


                                                                    })
                                                                }
                                                            }

                                                            }
                                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                        />

                                                    </div>

                                                    <div className="col-span-5 md:col-span-1">
                                                        {/* <label className="mr-2 block text-sm font-medium text-gray-700">
                                                    رقم المركبة
                                                </label> */}
                                                        <input
                                                            value={item?.carnum || ''}
                                                            required
                                                            maxLength={11}
                                                            minLength={11}
                                                            pattern="[0][0-9]{10}"
                                                            // title="الرجاء ادخال رقم المركبة"
                                                            // disabled={reqdisable}
                                                            onChange={e => {
                                                                {
                                                                    setVehicle_reservations((old) => {
                                                                        const update = [...old]


                                                                        update[index] = { ...update[index], carnum: e.target.value }
                                                                        return update;


                                                                    })
                                                                }
                                                            }
                                                            }
                                                            type="text"
                                                            placeholder={` الرقم ${dataBody?.reservation_cat == 1 ? "للمركبة" : dataBody?.reservation_cat == 3 ? "للدراجة" : ""}`}
                                                            name="first-name"
                                                            id="first-name"
                                                            autoComplete="given-name"
                                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                        />
                                                    </div>

                                                    {item?.carnumtype?.value == 1 &&
                                                        <div className="col-span-5 md:col-span-1">
                                                            {/* <label className="mr-2 block text-sm font-medium text-gray-700">
                                                        الحرف
                                                    </label> */}

                                                            <Select
                                                                isClearable
                                                                required
                                                                isSearchable
                                                                // isDisabled={reqdisable}
                                                                defaultInputValue=""
                                                                value={item.characternum}
                                                                placeholder="اختر الحرف"
                                                                options={letterTypes}


                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"


                                                                onChange={e => {
                                                                    {
                                                                        setVehicle_reservations((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], characternum: e }
                                                                            return update;


                                                                        })
                                                                    }
                                                                }}
                                                            />

                                                        </div>
                                                    }
                                                </div>
                                            </div>


                                            <div className=" px-4 py-5 sm:py-3 sm:px-6">
                                                <div className="grid grid-cols-5 gap-2">
                                                    {/* <div className="col-span-5 md:col-span-1"> */}
                                                    {/* <label className="mr-2 block text-sm font-medium text-gray-700">
                                                    المحافظة
                                                </label> */}

                                                    {/* <Select
                                                            isClearable
                                                            required
                                                            isSearchable
                                                            isDisabled={
                                                                !((dataBody.car_category_id && dataBody.carnumtype === 2)
                                                                    || (dataBody.car_category_id && (dataBody.carnumtype === 1)
                                                                        && (dataBody.characternum !== null && dataBody.characternum !== '')))
                                                            }
                                                            defaultInputValue=""
                                                            value={governsSelect}
                                                            placeholder="اختر المحافظة"
                                                            options={governs}
                                                            onChange={val => {
                                                                SetdataBody({ ...dataBody, goverID: val?.value, reviewID: null, transID: null })
                                                                setGovernsSelect(val)
                                                                getSiteFilterLocation()
                                                                setFirstVisit(3)
                                                                setTransationtypeSelect(null)
                                                            }}
                                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                        /> */}

                                                    {/* </div> */}

                                                    {/* <div className="col-span-5 md:col-span-1"> */}
                                                    {/* <label className="mr-2 block text-sm font-medium text-gray-700">
                                                    موقع المراجعة المطلوب
                                                </label> */}
                                                    {/* 
                                                        <Select
                                                            isClearable
                                                            required
                                                            isSearchable
                                                            isDisabled={!(dataBody.goverID)}
                                                            defaultInputValue=""
                                                            value={reviewsitSelect}
                                                            placeholder="اختر موقع المراجعة المطلوب"
                                                            options={reviewsit}
                                                            onChange={val => {
                                                                console.log('val', val);
                                                                setTransationtypeSelect(null)
                                                                setbookingHours([])
                                                                getbookingHours(val?.id)
                                                                getFirstVisit(val?.value)
                                                                setReviewsitSelect(val)
                                                                SetdataBody({ ...dataBody, reviewID: val?.value, transID: null })
                                                                setReviewID(val?.value)
                                                                getTransactionFromSite(val?.value)
                                                            }
                                                            }
                                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                        /> */}

                                                    {/* </div> */}

                                                    {/* <div className="col-span-5 md:col-span-1"> */}
                                                    {/* <label className="mr-2 block text-sm font-medium text-gray-700">
                                                    نوع المعاملة
                                                </label> */}

                                                    {/* <Select
                                                            isDisabled={!(dataBody.reviewID)}
                                                            isClearable
                                                            required
                                                            isSearchable
                                                            // isDisabled={reqdisable}
                                                            defaultInputValue=""
                                                            value={transationtypeSelect}
                                                            placeholder="اختر نوع المعاملة"
                                                            options={transationtype}
                                                            onChange={val => {
                                                                setTransationtypeSelect(val)
                                                                SetdataBody({ ...dataBody, transID: val?.value })
                                                            }}
                                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                        /> */}

                                                    {/* </div> */}

                                                </div>
                                                {notificationsData?.value &&
                                                    <p style={{ marginTop: '15px', marginBottom: '-10px', color: 'red' }}>*ملاحظة: {notificationsData1?.value}</p>
                                                }
                                                {dataBody.reservation_cat == 1 &&
                                                    <div style={{ marginTop: '15px' }}>
                                                        {firstVisit == 1 &&
                                                            <p style={{ color: 'red' }}>*ملاحظة: هذا الموقع يشمل فقط انواع السنويات التي تحتوي على ارقام المراجعة الاولى ولايتم قبول غيرها</p>}
                                                        {firstVisit == 2 &&
                                                            <p style={{ color: 'red' }}>*ملاحظة: هذا الموقع لا يشمل انواع السنويات التي تحتوي على ارقام المراجعة الاولى ويقبل فقط التي لاتحتوي على ذلك</p>}
                                                    </div>}
                                            </div>
                                        </>)
                                    })}
                                    <div className="flex justify-center items-center gap-4 my-6">
                                        {/* Add Button */}
                                        <button
                                            type="button"
                                            className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-600 text-white text-2xl font-bold shadow-md hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 disabled:bg-gray-300 disabled:text-slate-400"
                                            onClick={() =>
                                                setVehicle_reservations((prev) => [...prev, {}])
                                            }
                                            title="إضافة مركبة"
                                        >
                                            +
                                        </button>

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white text-2xl font-bold shadow-md hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:bg-gray-300 disabled:text-slate-400"
                                            onClick={() =>
                                                setVehicle_reservations((prev) => {
                                                    const updated = [...prev];
                                                    updated.pop();
                                                    return updated;
                                                })
                                            }
                                            title="حذف مركبة"
                                        >
                                            –
                                        </button>
                                    </div>

                                    {/* license */}


                                    <>
                                        <div style={{ backgroundColor: "rgb(51 103 145 / 85%)" }} className="w-full rounded-md p-1 my-4">
                                            <h3 className="text-xl text-center font-bold leading-6 text-gray-50 m-3 ">المرافقين </h3>
                                        </div>

                                        <div className=" px-4 py-5 sm:py-3 sm:px-6">
                                            <div className="grid grid-cols-5 gap-2">

                                            </div>
                                            {/* <p style={{marginTop:'15px',marginBottom:'0px', color: 'red' }}>*ملاحظة: هذا الموقع يشمل فقط انواع السنويات التي تحتوي على ارقام المراجعة الاولى ولايتم قبول غيرها</p> */}

                                        </div>

                                    </>


                                    <div className="px-4 py-5 sm:py-3 sm:px-6 ">

                                        {escorts.map((item, index) => {

                                            return (

                                                <>
                                                    <div className="grid grid-cols-5 gap-2">
                                                        <div className="col-span-5 md:col-span-1">
                                                            <input
                                                                // disabled={reqdisable}
                                                                value={item?.exname1 || ''}
                                                                required
                                                                maxLength={15}
                                                                // pattern='^[\u0600-\u06FF\s]+$'
                                                                pattern="/^[\u0600-\u06FF\s]+$/"
                                                                title="الرجاء ادخال الاسم باللغة العربية"
                                                                // onInvalid="setCustomValidity('Please enter at least 5 characters')"
                                                                onChange={e => {
                                                                    {
                                                                        setEscorts((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], exname1: AtxtValid(e.target.value, "الاسم") == true ? e.target.value : '' }
                                                                            return update;


                                                                        })
                                                                    }
                                                                }

                                                                }
                                                                type="text"
                                                                placeholder="الاسم"
                                                                name="first-name"
                                                                id="first-name"
                                                                // autoComplete="given-name"
                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm "
                                                            />
                                                        </div>

                                                        <div className="col-span-5 md:col-span-1">
                                                            <input
                                                                // disabled={reqdisable}
                                                                value={item?.exname2 || ''}
                                                                required
                                                                maxLength={15}
                                                                pattern='^[\u0600-\u06FF\s]+$'
                                                                title="الرجاء ادخال الاسم باللغة العربية"
                                                                // onChange={e => setreqname2(e.target.value)}
                                                                onChange={e => {
                                                                    {
                                                                        setEscorts((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], exname2: AtxtValid(e.target.value, "اسم الاب") == true ? e.target.value : '' }
                                                                            return update;


                                                                        })
                                                                    }
                                                                }}
                                                                type="text"
                                                                // onChange={handleInputChange}
                                                                placeholder="اسم الاب"
                                                                name="first-name"
                                                                id="first-name"
                                                                autoComplete="given-name"
                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                            />
                                                        </div>

                                                        <div className="col-span-5 md:col-span-1">
                                                            <input
                                                                // disabled={reqdisable}
                                                                value={item?.exmname3 || ''}
                                                                required
                                                                maxLength={15}
                                                                pattern='^[\u0600-\u06FF\s]+$'
                                                                title="الرجاء ادخال الاسم باللغة العربية"

                                                                onChange={e => {
                                                                    {
                                                                        setEscorts((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], exmname3: AtxtValid(e.target.value, "اسم الجد") == true ? e.target.value : '' }
                                                                            return update;


                                                                        })
                                                                    }
                                                                }}
                                                                type="text"
                                                                placeholder="اسم الجد"
                                                                name="first-name"
                                                                id="first-name"
                                                                autoComplete="given-name"
                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                            />
                                                        </div>

                                                        <div className="col-span-5 md:col-span-1">
                                                            <input
                                                                // disabled={reqdisable}
                                                                value={item?.exsname || ''}
                                                                required
                                                                maxLength={15}
                                                                pattern='^[\u0600-\u06FF\s]+$'
                                                                onChange={e => {
                                                                    {
                                                                        setEscorts((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], exsname: AtxtValid(e.target.value, "اللقب") == true ? e.target.value : '' }
                                                                            return update;


                                                                        })
                                                                    }
                                                                }}
                                                                title="الرجاء ادخال اللقب باللغة العربية"
                                                                type="text"
                                                                placeholder="اللقب"
                                                                name="first-name"
                                                                id="first-name"
                                                                autoComplete="given-name"
                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-5 md:col-span-1">
                                                            <label className="mr-2 block text-sm font-medium text-gray-700">
                                                                الموالبد
                                                            </label>
                                                            <input
                                                                // disabled={reqdisable}
                                                                value={item?.exbrithdate || ''}


                                                                onChange={e => {
                                                                    const selectedDate = dayjs(e.target.value, 'YYYY-MM-DD', true);

                                                                    {
                                                                        setEscorts((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], exbrithdate: selectedDate.format('YYYY-MM-DD') }
                                                                            return update;


                                                                        })
                                                                    }
                                                                }}

                                                                date
                                                                // required
                                                                type="date"
                                                                placeholder=""
                                                                name="contid"
                                                                // min={lastMonth}
                                                                // max={maxDate}
                                                                // autoComplete="given-name"
                                                                className="mt-1   block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                            />
                                                        </div>

                                                    </div>
                                                    <div className="grid grid-cols-5 gap-2">
                                                        <div className="col-span-4 md:col-span-1">
                                                            <input
                                                                // disabled={reqdisable}
                                                                value={item?.exmname1 || ''}
                                                                required
                                                                maxLength={15}
                                                                pattern='^[\u0600-\u06FF\s]+$'


                                                                onChange={e => {
                                                                    {
                                                                        const val = e.target.value

                                                                        setEscorts((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], exmname1: AtxtValid(val, "اسم الام") == true ? val : '' }
                                                                            return update;

                                                                        })
                                                                    }
                                                                }}
                                                                title="الرجاء ادخال أسم الام  باللغة العربية"
                                                                type="text"
                                                                placeholder="أسم الام "
                                                                name="first-name"
                                                                id="first-name"
                                                                autoComplete="given-name"
                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-5 md:col-span-1">
                                                            <input
                                                                // disabled={reqdisable}
                                                                value={item?.exmname2 || ''}
                                                                required
                                                                maxLength={15}
                                                                pattern='^[\u0600-\u06FF\s]+$'

                                                                onChange={e => {
                                                                    {
                                                                        const val = e.target.value
                                                                        setEscorts((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], exmname2: AtxtValid(val, "اسم اب الام") == true ? val : '' }
                                                                            return update;


                                                                        })
                                                                    }
                                                                }}

                                                                title="الرجاء ادخال أسم أب الام  باللغة العربية"
                                                                type="text"
                                                                placeholder="أسم أب الام "
                                                                name="first-name"
                                                                id="first-name"
                                                                autoComplete="given-name"
                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-5 md:col-span-1">
                                                            <input
                                                                value={item?.exid_card || ''}
                                                                required
                                                                maxLength={14}
                                                                pattern="^\d{14}$"
                                                                inputMode="numeric"

                                                                onChange={e => {
                                                                    {
                                                                        const val = e.target.value;
                                                                        if (/^\d{0,12}$/.test(val)) {
                                                                            // إذا تم إدخال 4 أرقام أو أكثر، تحقق من السنة
                                                                            if (val.length >= 4) {
                                                                                const year = parseInt(val.slice(0, 4), 10);
                                                                                if (year >= 1900 && year <= 2099) {
                                                                                    // أقل من 4 أرقام → نسمح بالإدخال بدون تحقق السنة
                                                                                    setEscorts((old) => {
                                                                                        const update = [...old]


                                                                                        update[index] = { ...update[index], exid_card: pohoneValid(val) == true ? val : null }
                                                                                        return update;


                                                                                    })
                                                                                }
                                                                            } else {
                                                                                // أقل من 4 أرقام → نسمح بالإدخال بدون تحقق السنة
                                                                                setEscorts((old) => {
                                                                                    const update = [...old]


                                                                                    update[index] = { ...update[index], exid_card: pohoneValid(val) == true ? val : null }
                                                                                    return update;


                                                                                })
                                                                            }
                                                                        }

                                                                    }
                                                                }}
                                                                title="الرجاء إدخال رقم البطاقة الموحدة المكون من 14 رقمًا"
                                                                type="text"
                                                                placeholder="رقم البطاقة الموحدة"
                                                                name="id-card"
                                                                id="id-card"
                                                                autoComplete="off"
                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                            />

                                                        </div>
                                                        <div className="col-span-5 md:col-span-1">
                                                            {/* <label className="mr-2 block text-sm font-medium text-gray-700">
                                                    رقم الموبايل
                                                </label> */}
                                                            <input
                                                                value={item?.exphonenum || ''}
                                                                required
                                                                maxLength={11}
                                                                minLength={11}
                                                                pattern="[0][0-9]{10}"
                                                                title="الرجاء ادخال رقم الموبايل (11 رقم)"
                                                                // disabled={reqdisable}
                                                                onChange={e => {
                                                                    const val = e.target.value
                                                                    {
                                                                        setEscorts((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], exphonenum: pohoneValid(val) == true ? val : null }
                                                                            return update;


                                                                        })
                                                                    }
                                                                }}
                                                                type="text"
                                                                placeholder="رقم الموبايل"
                                                                name="first-name"
                                                                id="first-name"
                                                                autoComplete="given-name"
                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-5 md:col-span-1">
                                                            <input
                                                                // disabled={reqdisable}
                                                                value={item?.exvistor_org || ''}
                                                                required
                                                                maxLength={15}
                                                                pattern='^[\u0600-\u06FF\s]+$'
                                                                onChange={e => {
                                                                    const val = e.target.value
                                                                    {
                                                                        setEscorts((old) => {
                                                                            const update = [...old]


                                                                            update[index] = { ...update[index], exvistor_org: AtxtValid(val, "جهة الانتساب") == true ? val : '' }
                                                                            return update;


                                                                        })
                                                                    }
                                                                }}
                                                                title="الرجاء ادخال جهة الانتساب"
                                                                type="text"
                                                                placeholder="جهة الانتساب"
                                                                name="badge"
                                                                id="badge"
                                                                autoComplete="given-name"
                                                                className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <hr className="border-t-4 border-blue-500 rounded-full my-6" />
                                                </>
                                            )
                                        })}

                                        <div className="flex justify-center items-center gap-4 my-6">
                                            {/* Add Escort Button */}
                                            <button
                                                type="button"
                                                className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-600 text-white text-2xl font-bold shadow-md hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 disabled:bg-gray-300 disabled:text-slate-400"
                                                onClick={() =>
                                                    setEscorts((prev) => [...prev, {}])
                                                }
                                                title="إضافة مرافق"
                                            >
                                                +
                                            </button>

                                            {/* Remove Escort Button */}
                                            <button
                                                type="button"
                                                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white text-2xl font-bold shadow-md hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:bg-gray-300 disabled:text-slate-400"
                                                onClick={() =>
                                                    setEscorts((prev) => {
                                                        const updated = [...prev];
                                                        updated.pop();
                                                        return updated;
                                                    })
                                                }
                                                title="حذف مرافق"
                                            >
                                                –
                                            </button>
                                        </div>


                                    </div>
                                    <div style={{ backgroundColor: "rgb(51 103 145 / 85%)" }} className="w-full rounded-md p-1 mb-4">
                                        <h3 className="text-xl text-center font-bold leading-6 text-gray-50 m-3 ">الغرض من الزيارة</h3>
                                    </div>
                                    <div className="col-span-5 md:col-span-1">
                                        <textarea
                                            // disabled={reqdisable}
                                            value={dataBody?.purpose || ''}
                                            required
                                            pattern='^[\u0600-\u06FF\s]+$'
                                            // pattern= "/^[\u0600-\u06FF\s]+$/" 
                                            // title="الرجاء ادخال الاسم باللغة العربية"
                                            // onInvalid="setCustomValidity('Please enter at least 5 characters')"
                                            onChange={e => { SetdataBody({ ...dataBody, purpose: e.target.value }) }}
                                            type="text"
                                            placeholder="الغرض من الزيارة"
                                            name="purpose"
                                            id="purpose"
                                            autoComplete="given-name"

                                            className="mt-1 block w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm "
                                        />
                                    </div>

                                </div>

                                {checkValidation() == true &&
                                    <>
                                        <div style={{ backgroundColor: "rgb(51 103 145 / 85%)" }} className="w-full rounded-md p-1 my-4">
                                            <h3 className="text-xl text-center font-bold leading-6 text-gray-50 m-3 ">معلومات التحقق </h3>
                                        </div>
                                        {/* captchaNew */}
                                        <div className=" px-4 sm:px-6">
                                            <div className="grid grid-cols-8 gap-2">
                                                {/* <div className="col-span-8 md:col-span-1"></div>
                                                <div className="col-span-8 md:col-span-1"></div>
                                                <div className="col-span-8 md:col-span-1"></div> */}
                                                <div className="col-span-8 md:col-span-2">
                                                    <div className="py-2" style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
                                                        {ValidError === false &&
                                                            <div className="canv" >
                                                                <img style={{ borderRadius: "5px", overflow: "hidden" }} src={captchaImg} alt="CAPTCHA" />
                                                            </div>
                                                        }
                                                        <p style={{ marginTop: '10px' }}>{captchaQuestion}</p>
                                                        {ValidError === false && <p style={{ marginTop: '10px' }}>الوقت المتبقي للشكل الحالي: {formatSecondsToClock(countdown)} ثانية</p>}
                                                        {ValidError === true && <p style={{ marginTop: '10px' }}>لديك طلب مسبق! بأمكانك الطلب من جديد بعد: {formatSecondsToClock(countdown)} دقيقة</p>}
                                                        <input
                                                            disabled={ValidError}
                                                            type="text"
                                                            className="mt-3 w-full rounded-md border-slate-400 shadow-sm focus:border-sky-500 focus:ring-sky-500 "
                                                            value={inValue}
                                                            onChange={(e) => { handleInputChange(e) }}
                                                            ref={intervalRef} placeholder="ادخل حل السؤال اعلاه" autoComplete="off" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>}
                            </form>
                        </div>
                        {/* part 1 */}

                        < div className="" >
                            <ToastContainer />
                        </div >
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center my-4">
                    <div className="py-2">
                        <button
                            // disabled={!(
                            //     checkValidation() == true
                            // ) || ValidError == true}
                            type="submit"
                            // className="text-white bg-gray-400 hover:bg-sky-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-400 dark:hover:bg-sky-700 focus:outline-none dark:focus:ring-blue-800 content-center w-64"
                            className="inline-flex justify-end rounded-md border border-transparent
                                             bg-sky-600 text-white hover:bg-sky-700 focus:ring-4 py-2 px-10 text-xl 
                                             font-medium  shadow-sm  focus:outline-none focus:ring-sky-500 focus:rin    g-offset-2
                                             disabled:bg-gray-300 disabled:text-slate-400
                                             "
                            onClick={(e) => { handleSubmit(e) }}
                        >
                            حفظ و استمرار
                        </button>
                    </div>
                </div>

            </>
        )
    )
}