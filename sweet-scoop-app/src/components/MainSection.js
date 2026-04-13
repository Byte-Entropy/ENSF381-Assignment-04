import React, { useState, useEffect } from "react";

function MainSection() {
  const [randomFlavors, setRandomFlavors] = useState([]);
  const [randomReviews, setRandomReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch flavors from backend
        const flavorsResponse = await fetch("http://localhost:5000/flavors");
        const flavorsData = await flavorsResponse.json();
        
        if (flavorsData.success && flavorsData.flavors) {
          // Get 3 random flavors
          const shuffled = [...flavorsData.flavors].sort(() => 0.5 - Math.random());
          setRandomFlavors(shuffled.slice(0, 3));
        }
        
        // Fetch reviews from backend
        const reviewsResponse = await fetch("http://localhost:5000/reviews");
        const reviewsData = await reviewsResponse.json();
        
        if (reviewsData.success && reviewsData.reviews) {
          setRandomReviews(reviewsData.reviews);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load featured content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="main-section"><p>Loading...</p></div>;
  }

  return (
    <div className="main-section">
      <h2>About Sweet Scoop</h2>
      <p className="about-text">
        Sweet Scoop offers a variety of delicious ice cream flavors made from fresh ingredients.
      </p>

      {error && <p className="error-message">{error}</p>}

      <h2>Featured Flavors</h2>
      <div className="featured-flavors">
        {randomFlavors.length > 0 ? (
          randomFlavors.map((f) => (
            <div className="flavor-card" key={f.id}>
              <h4>{f.name}</h4>
              <p>${f.price}</p>
            </div>
          ))
        ) : (
          <p>No flavors available</p>
        )}
      </div>

      <h2>Customer Reviews</h2>
      <div className="reviews">
        {randomReviews.length > 0 ? (
          randomReviews.map((r, i) => (
            <div key={i}>
              <h4>{r.customerName}</h4>
              <p>{r.review}</p>
              <p>{"★".repeat(r.rating)}</p>
            </div>
          ))
        ) : (
          <p>No reviews available</p>
        )}
      </div>
    </div>
  );
}

export default MainSection;