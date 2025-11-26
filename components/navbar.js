
import profilePic from '../public/moi_svg.svg'
import Image from 'next/image'

export default function Navbar() {
    return (
        <>
            <nav className=" bg-white px-2 sm:px-4 py-1  w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600 sticky"
                style={{ 'backgroundColor': "rgb(23 71 109 / 90%)" }}
                >
                <div className=" flex flex-wrap px-8 items-center justify-between mx-auto md:grid md:grid-cols-3 md:gap-6" >

                    <div className="flex md:col-span-1 ">

                        <span className="self-center text-base md:text-xl font-semibold whitespace-nowrap dark:text-white">
                            <p className="mb-3 font-light text-center " style={{ color: '#ddd' }}>
                                وزارة الداخلية <br />
                                الاستعلامات الالكترونية <br />
                            </p>
                        </span>
                    </div>

                    {/* <div className="flex md:order-2 md:col-span-1 justify-end"> */}
                    <div className="items-center justify-center md:flex md:w-auto md:order-1 md:col-span-1" id="navbar-sticky">
                        <Image className='w-20 h-20 md:w-24 md:h-24' src={profilePic} alt="MOI" />
                    </div>

                    <div className="items-center justify-end w-full md:flex md:w-auto md:order-1 md:col-span-1" id="navbar-sticky">
                        <span className="self-center text-base md:text-xl font-semibold whitespace-nowrap dark:text-white">
                            <p className="mb-3 font-normal mt-[-20px] mr-[-8px] text-right md:font-bold md:mt-0 md:mr-0 md:text-center" style={{ color: '#ddd' }}>
                                استمارة الحجز الالكتروني
                            </p>
                        </span>
                    </div>
                </div>
            </nav>
        </>
    )
}

