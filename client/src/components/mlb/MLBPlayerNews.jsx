export default function MLBPlayerNews({ news }) {
  if (!news?.length) {
    return null;
  }

  return (
    <section>
      <h2>News</h2>

      {news.map((article) => (
        <div key={article.id}>
          {article.image && (
            <img
              src={article.image}
              alt={article.headline}
              width="150"
            />
          )}

          {article.link ? (
            <a
              href={article.link}
              target="_blank"
              rel="noreferrer"
            >
              {article.headline}
            </a>
          ) : (
            <strong>{article.headline}</strong>
          )}

          {article.description && (
            <p>{article.description}</p>
          )}
        </div>
      ))}
    </section>
  );
}