import React from 'react';
import { Box, Typography, Rating } from '@mui/material';

function RatingSummary({ average, totalReviews }) {
  const averageNumber = Number.isFinite(Number(average)) ? Number(average) : 0;
  const reviewsCount = Number.isFinite(Number(totalReviews)) ? Number(totalReviews) : 0;

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Rating name="avg-rating" value={averageNumber} precision={0.5} readOnly />
      <Typography variant="body2" color="text.secondary">
        {reviewsCount > 0 ? `${averageNumber.toFixed(1)} (${reviewsCount} דירוגים)` : 'אין דירוגים'}
      </Typography>
    </Box>
  );
}

export default RatingSummary;


