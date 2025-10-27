import React from 'react';
import { Card, CardHeader, CardContent } from '@mui/material';

function SectionCard({ title, action, children }) {
  return (
    <Card>
      {title && <CardHeader title={title} action={action} />}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export default SectionCard;


