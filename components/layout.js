import { default as Navbar } from './navbar'
import { default as Footer } from './footer'

export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            <main className='mx-auto w-10/12'>{children}</main>
            <Footer />
        </>
    )
}