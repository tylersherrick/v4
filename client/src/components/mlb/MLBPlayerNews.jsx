export default function MLBPlayerNews({ news }) {
  if (!news?.length) {
    return (
      <section className="mlb-player-news-section">
        <h2>News</h2>
        <p>No recent news available.</p>
      </section>
    );
  }

  return (
    <section className="mlb-player-news-section">
      <h2>News</h2>

      <div className="mlb-player-news-list">
        {news.map((article) => (
          <article
            key={article.id}
            className="mlb-player-news-card"
          >
            {article.image && (
              <img
                src={article.image}
                alt={article.headline}
                className="mlb-player-news-image"
              />
            )}

            <div className="mlb-player-news-content">
              {article.link ? (
                <a
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mlb-player-news-headline"
                >
                  {article.headline}
                </a>
              ) : (
                <strong className="mlb-player-news-headline">
                  {article.headline}
                </strong>
              )}

              {article.description && (
                <p>{article.description}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}