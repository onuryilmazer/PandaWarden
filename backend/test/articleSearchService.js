import assert from 'assert';
import { afterEach, describe, it } from 'node:test';

import { articleSearcher } from '../services/articleSearchService.js';

describe('ArticleSearcher', () => {

    it('should throw an error if searchPhrase is not provided', async () => {
        try {
            await articleSearcher.query();
            assert.fail('Expected error was not thrown');
        } catch (error) {
            assert.strictEqual(error.message, "searchPhrase is required");
        }
    });

    /* it('should return article IDs matching the search phrase', async () => {
        //TODO

    });

    it('should return article IDs matching the search phrase and cutoff date', async () => {
        //TODO
    });

    it('should return an empty array if no articles match the search phrase', async () => {
        //TODO

        //const result = await articleSearcher.query("nonexistent phrase");
    }); */

    /* it('should handle database query errors gracefully', async () => {
        //dependency injection required
        try {
            await articleSearcher.query("error phrase");
            assert.fail('Expected error was not thrown');
        } catch (error) {
            assert.strictEqual(error.message, "Database error");
        }
    }); */

    /* it('should handle search phrases with multiple spaces correctly', async () => {
        //TODO

        //const result = await articleSearcher.query("  spaced   phrase  ");
    });

    it('should handle search phrases with special characters correctly', async () => {
        //TODO

        //const result = await articleSearcher.query("covid-19! vaccine?");
    }); */
});