import React from 'react';
import { Link } from 'react-router-dom';

const BlogPagination = ({ current, total, prevLink, nextLink }) => {
  return (
    <div className="blog-pagination">
      {prevLink ? (
        <Link to={prevLink} className="blog-pagination-link">← Previous</Link>
      ) : (
        <span className="blog-pagination-link disabled">← Previous</span>
      )}
      
      <span className="blog-pagination-number">{current} / {total}</span>
      
      {nextLink ? (
        <Link to={nextLink} className="blog-pagination-link">Next →</Link>
      ) : (
        <span className="blog-pagination-link disabled">Next →</span>
      )}
    </div>
  );
};

export default BlogPagination;
