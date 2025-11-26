import React from 'react'
import Image from 'next/image'
import loadingSVG from '../public/loading.svg'
import { MoonLoader } from 'react-spinners';

function Spinner({ loading }) {
    return (
        <span className='z-50'>
            {
                loading &&
                <div className="spinnerDiv">
                    {/* <img style={{ width: '150px', height: '150px' }} src='../public/loading.svg' alt="loading" /> */}
                    <Image src={loadingSVG} width={150} height={150} alt="loading" />
                    {/* <MoonLoader
                        className="spinner"
                        sizeUnit={"px"}
                        // size={950}
                        height={90}
                        width={9}
                        color={'#4AA3E3'}
                        loading={loading}
                        speedMultiplier={0.9}
                    /> */}
                </div>
            }
        </span>
    )
}

export default Spinner
