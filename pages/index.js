// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'
// import { default as Application } from './apply/application'
// import { default as Thankyou } from './apply/thankyou'
import { StrictMode } from 'react'
import { default as Start } from './apply/start'
import 'react-toastify/dist/ReactToastify.css'

export default function Home() {
    return (
        <>
            <StrictMode>
                <Start />
            </StrictMode>
        </>
    )
}



