import { Link } from 'react-router-dom'
import './Index.css'
import logo from "../../assets/logo.svg";
import { useAuth } from '../../context/AuthContext';

function Index() {
  const auth = useAuth();
  const loggedIn = !!auth.token;

  return (
    <div className="page-container">
      <div className="page-title"> <h1>Panda Warden</h1> </div>
      <div className="hero">
        <div className="logo-container">
          <img className="logo" src={logo} />
        </div>
        <div className="intro">
          <p>Enlist the help of our army of watchful pandas to monitor the internet, tracking news stories as they emerge in real-time.</p>
          <p>Stay on top of the news with real-time alerts and email notifications for your tracked topics.</p>
          <p>Create an account or log in to start using Panda Warden.</p>
        </div>
      </div>
      
      {
        loggedIn 
        ? <Link to={"/dashboard"}>Go to your dashboard</Link>
        : <Link to={"/login"}>Log in now</Link>
      }
    </div>
  )
}

export default Index
