import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArticle } from "../../services/ArticleService";
import { useAuth } from "../../context/AuthContext";

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

            <div className="block-container">
                <Link to={-1}>Go back to my dashboard</Link>
                <div>
                    <p>Source: {article?.source_name}</p>
                    <p>Collected at: {article?.created_at && new Date(article?.created_at).toLocaleString()}</p>
                </div>

            </div>

            <div className="block-container">
                <div>AI summary of the article: {article?.details_aisummary ?? "Not available."} </div>
            </div>

            <div className="block-container">
                <div className="block-header">
                        <div>Problem with article? Click the button to fetch it again.</div>
                        <button>🔁</button>
                </div>

                <div>
                    <label>
                        Article language: <br /><br />
                        <select>
                            <option>asd</option>
                        </select> 
                    </label>
                </div>
            </div>

            <div className="block-container">
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