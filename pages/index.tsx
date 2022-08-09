import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import App from '../components/App'

const Home: NextPage = () => {
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    setIsBrowser(process.browser)
  }, [])

  return (
    <div className={''}>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='h-screen w-screen'>{isBrowser ? <App /> : null}</main>

      <footer className=''></footer>
    </div>
  )
}

export default Home
