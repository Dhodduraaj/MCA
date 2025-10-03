const express = require("express");
const axios = require("axios");

const router = express.Router();

// @route GET /api/news/finance
router.get("/finance", async (req, res) => {
  try {
    const response = await axios.get(
      'https://newsapi.org/v2/everything?q=finance&sortBy=publishedAt&pageSize=20&apiKey=8800194631c5480e8c8aa40b765bb85b'
    );

    if (response.data.status === 'error') {
      return res.status(400).json({ message: response.data.message });
    }

    // Transform the data to include required fields
    const transformedNews = response.data.articles.map((article, index) => ({
      id: index + 1,
      title: article.title || 'No title available',
      description: article.description || 'No description available',
      fullDescription: article.content || article.description || 'No content available',
      publishedAt: article.publishedAt,
      urlToImage: article.urlToImage || '/placeholder-news.jpg',
      source: article.source?.name || 'Unknown Source',
      url: article.url
    }));

    res.json({ articles: transformedNews });
  } catch (error) {
    console.error('News API Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

module.exports = router;
