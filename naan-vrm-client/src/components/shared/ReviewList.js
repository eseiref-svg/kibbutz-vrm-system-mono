import React from 'react';
import { Box, Typography, Rating, Divider } from '@mui/material';

function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <Typography variant="body2">עדיין אין דירוגים עבור ספק זה.</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {reviews.map((review, idx) => (
        <Box key={review.review_id || idx}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Rating value={review.rate} readOnly size="small" precision={0.1} />
            <Typography variant="caption" color="text.secondary">
              {new Date(review.date).toLocaleDateString('he-IL')}
            </Typography>
          </Box>
          {review.comment && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              "{review.comment}"
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'left', mt: 0.5 }}>
            מאת: {review.first_name} {review.surname}
          </Typography>
          {idx < reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}
    </Box>
  );
}

export default ReviewList;


