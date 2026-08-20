import { useState } from "react";
import API from "../Services/api";

function ReviewForm({ foodId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitReview = async () => {
    try {
      await API.post("reviews/", {
        food: foodId,
        rating,
        comment,
      });

      alert("Review submitted successfully!");
      setComment("");
      setRating(5);
    } catch (error) {
      console.error(error);
      alert("Failed to submit review.");
    }
  };

  return (
    <div className="mt-3">
      <h5>Leave a Review</h5>

      <select
        className="form-select mb-2"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        <option value={5}>⭐⭐⭐⭐⭐</option>
        <option value={4}>⭐⭐⭐⭐</option>
        <option value={3}>⭐⭐⭐</option>
        <option value={2}>⭐⭐</option>
        <option value={1}>⭐</option>
      </select>

      <textarea
        className="form-control mb-2"
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        className="btn btn-primary"
        onClick={submitReview}
      >
        Submit Review
      </button>
    </div>
  );
}

export default ReviewForm;