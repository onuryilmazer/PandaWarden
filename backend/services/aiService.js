import OpenAI from "openai";
import * as db from "./databaseService.js";
import "../utils/config.js";


class AiService {
    systemPrompt = "You are a helpful assistant that generates short summaries about the newspaper articles given to you. Your summaries are about one paragraph long, but they can be shorter when the article is very short.";

    constructor() {
        this.openai = new OpenAI();
    }

    async generateArticleSummary({articleTitle, articleText}) {
        const completion = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: this.systemPrompt },
                {
                    role: "user",
                    content: `Title: ${articleTitle} \n Content: ${articleText}`
                },
            ],
        });

        return completion.choices[0].message.content;
    }

    async generateAndSaveArticleSummariesForAllArticles() {
        const articlesWithNoSummaryQuery = await db.query(
            `SELECT id, catalog_title, catalog_description, details_title, details_description
            FROM articles
            WHERE details_aisummary IS NULL OR details_aisummary = ''
            ORDER BY id DESC`
        );

        for(const article of articlesWithNoSummaryQuery.rows) {
            console.log(`Generating summary for article ${article.id}`);

            try {
                const summary = await this.generateArticleSummary({
                    articleTitle: article.details_title || article.catalog_title,
                    articleText: article.details_description || article.catalog_description
                });
    
                await db.query(
                    `UPDATE articles
                    SET details_aisummary = $1
                    WHERE id = $2`,
                    [summary, article.id]
                );
            }
            catch (e) {
                console.log(`Error while generating summary for article ${article.id}: ${e.message}`);
            }
        }
    }
}

const aiService = new AiService();

export {aiService};