import { Link } from 'react-router-dom'
import './Index.css'

function Index() {

  return (
    <div className="indexContainer">
      <HeroSection />
    </div>
  )
}

function HeroSection() {
  return (
    <div className='hero'>
      <h1>
        Panda Warden
      </h1>
      <div>
        Panda Warden helps you monitor the internet and track news as they appear. <br></br> Create an account or log in to start using Panda Warden.
      </div>

      <Link to={"/login"}>Log in now</Link>
    </div>
  )
}

export default Index
