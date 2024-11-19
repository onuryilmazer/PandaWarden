import { Link } from 'react-router-dom'
import './Index.css'
import logo from "../../../assets/logo.svg";
import { useAuth } from '../../../context/AuthContext';

import monitoringRequestImage from "../../../assets/monitor.png";
import summarizationImage from "../../../assets/aisummary.png";
import browseImage from "../../../assets/browse.png";

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
          <p>Panda Warden helps you track news from around the world by monitoring online news agencies.</p>
          <p>You can start browsing our collection of news articles as a guest.</p>
          <p>After registration, you will be able to create monitoring requests, and Panda Warden will send you regular reports about the topics you are interested in.</p>
          <div className='action-link'>
              <Link to={"/dashboard"}>Start browsing {!loggedIn && "as a guest"}</Link><br />
              {!loggedIn && <Link to={"/signup"}>Register now</Link>}
          </div>
        </div>
      </div>
      

      <Features />
    </div>
  )
}

function Features() {
  return (
    <div className=" features">
      <div className="block-header"> <h1>Features</h1> </div>
      <div className="feature">
        <h2>Monitoring requests</h2>
        <img src={monitoringRequestImage} alt="monitoring request" />
        <p>Create monitoring requests and receive alerts.</p>
      </div>
      <div className="feature">
        <h2>Summarization</h2>
        <img src={summarizationImage} alt="summarization" />
        <p>Get AI-generated summaries of the articles you monitor.</p>
      </div>
      <div className="feature">
        <h2>Browse articles</h2>
        <img src={browseImage} alt="browse articles" />
        <p>Browse through collected news articles.</p>
      </div>
    </div>
  )
}

export default Index
