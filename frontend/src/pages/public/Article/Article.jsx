import "./Article.css";

import openAiLogo from "../../../assets/openai.png";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArticle } from "../../../services/ArticleService";
import { useAuth } from "../../../context/AuthContext";

function Article() {
    const auth = useAuth();
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [displaySource, setDisplaySource] = useState(false);

    const [thrownError, setThrownError] = useState(null);  //set from async function and thrown again, so the error boundary can catch it.
    if (thrownError) throw thrownError;

    useEffect(() => {
        getArticle({ id, token: auth.token })
            .then(article => setArticle(article))
            .catch(e => {
                setThrownError(e);
            });
    }, [id, auth.token]);

    return (
        <div className="page-container">
            <div className="page-title"> <h1>{article?.details_title}</h1> </div>
            <Link to={-1}>Return to dashboard</Link>

            <div className="block-container">
                <div className="block-header">
                    <h2>Metadata</h2>
                </div>
                <div>
                    <p>Source: {article?.source_name}</p>
                    <p>Collected at: {article?.created_at && new Date(article?.created_at).toLocaleString()}</p>
                </div>

            </div>

            <div className="block-container">
                <div className="block-header">
                    <h2>AI summary of the article</h2>
                </div>
                <div>
                    <label>
                        Summary language: <br /><br />
                        <select disabled>
                            <option>English</option>
                        </select> 
                    </label>
                </div>

                <div className="article-summary">
                    <div className="summary-logo">
                        <img src={openAiLogo} />
                    </div>
                    <div className="summary-text">
                        {article?.details_aisummary ?? "Not available."} 
                    </div>
                </div>
            </div>

            {/* <div className="block-container">
                <div className="block-header">
                    <h2>Controls</h2>
                </div>

                <div>
                    <label>
                        Troubleshooting <br /><br />
                        <button>🔁 Fetch Article Again</button>
                    </label>
                </div>
                
                
            </div> */}

            <div className="block-container">
                <div className="block-header">
                    <h2>Article screenshot</h2>
                </div>
                <a href={article?.details_url} rel="noreferrer" style={{fontSize: "large"}} >Click here to visit the original source</a>
                <div className="thumbnail">
                    <img style={{maxWidth: "100%"}} src={"/" + article?.details_screenshot_path}></img>
                </div>

                <div>
                    Source text: <button onClick={() => setDisplaySource(s => !s)} >👁️‍🗨️</button>
                    {displaySource && <pre style={{ whiteSpace: "pre-wrap" }}> {article?.details_description}</pre>}
                </div>
            </div>
        </div>
    )
}

export default Article;