import { useEffect, useRef, useState } from 'react';

const FinancialNewsCarouselLanding = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const carouselRef = useRef(null);

  const NEWS_API_KEY = '8800194631c5480e8c8aa40b765bb85b';
  const NEWS_API_URL = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`;

  // Fetch news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(NEWS_API_URL);
        if (!response.ok) throw new Error('Failed to fetch news');

        const data = await response.json();

        if (data.status !== 'ok') throw new Error(data.message || 'Failed to fetch news');

        const articles = data.articles.map((article, index) => ({
          id: index,
          title: article.title,
          description: article.description || 'No description available.',
          fullDescription: article.content || article.description || 'No additional content available.',
          publishedAt: article.publishedAt,
          urlToImage: article.urlToImage || 'https://via.placeholder.com/380x260?text=No+Image',
          source: article.source.name,
          url: article.url,
        }));

        setNews(articles);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Auto scroll carousel slowly
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({ left: 1, behavior: 'smooth' });
        // Loop to start
        if (
          carouselRef.current.scrollLeft + carouselRef.current.clientWidth >=
          carouselRef.current.scrollWidth
        ) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }, 20); // small scroll every 20ms for slow movement

    return () => clearInterval(interval);
  }, [news]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return 'Invalid date';
    }
  };

  const openModal = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    document.body.style.overflow = 'unset';
  };

  const NewsCard = ({ article }) => (
    <div
      className="flex-shrink-0 w-[380px] h-[260px] bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
      onClick={() => openModal(article)}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={article.urlToImage}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-4 h-[120px] flex flex-col justify-between">
        <div>
          <h3
            className="font-semibold text-sm md:text-base text-gray-900 leading-tight overflow-hidden"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {article.title}
          </h3>
          <p
            className="text-xs md:text-sm text-gray-600 mt-1 leading-tight overflow-hidden"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {article.description}
          </p>
        </div>
        <div className="flex justify-between items-center text-xs md:text-sm text-gray-500 mt-2">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="font-medium">{article.source}</span>
        </div>
      </div>
    </div>
  );

  const Modal = () => {
    if (!isModalOpen || !selectedArticle) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={closeModal}
        ></div>
        <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="overflow-y-auto max-h-[90vh]">
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={selectedArticle.urlToImage}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                }}
              />
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h2>
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <span className="mr-4">{formatDate(selectedArticle.publishedAt)}</span>
                <span className="font-medium">{selectedArticle.source}</span>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-2"><strong>Description:</strong> {selectedArticle.description}</p>
                <p className="text-gray-700 leading-relaxed"><strong>Content:</strong> {selectedArticle.fullDescription}</p>
              </div>
              {selectedArticle.url && (
                <div className="mt-6">
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Read Full Article
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const ErrorMessage = ({ errorMessage }) => (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="text-red-500 text-xl mb-2">⚠️</div>
        <p className="text-red-600 font-medium">Failed to load financial news</p>
        <p className="text-gray-600 text-sm mt-1">{errorMessage || 'Unknown error occurred'}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Latest Financial News</h2>
        <p className="text-gray-800 font-semibold">Stay updated with the latest financial market news and insights</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage errorMessage={error} />
      ) : news.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-gray-400 text-xl mb-2">📰</div>
            <p className="text-gray-600 font-medium">No news articles found</p>
            <p className="text-gray-500 text-sm mt-1">Try refreshing the page</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex space-x-5 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {news.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      <Modal />
    </div>
  );
};

export default FinancialNewsCarouselLanding;
