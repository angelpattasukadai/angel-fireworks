import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

// Legal ordering notice required for online fireworks (2018 Supreme Court order).
// Shown on Home and Checkout so customers understand the enquiry-based ordering flow.
const LegalNotice = ({ sx }) => (
  <Container maxWidth="lg" sx={{ ...sx }}>
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: { xs: 2.5, md: 3 },
        borderRadius: '18px',
        bgcolor: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        alignItems: 'flex-start',
      }}
    >
      <Box sx={{ color: '#f59e0b', display: 'inline-flex', mt: 0.3, flexShrink: 0 }}>
        <AlertTriangle size={26} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 800, color: '#F6C453', fontSize: '1rem', mb: 1 }}>
          How to Order — Important Notice
        </Typography>
        <Typography sx={{ color: '#E6DDF5', fontSize: '0.92rem', lineHeight: 1.75 }}>
          As per the <strong>2018 Supreme Court order, online sale of firecrackers is not permitted.</strong> We value
          our customers and, at the same time, respect the law. Please add the crackers you need to the cart and submit
          your enquiry using the <strong>Enquiry button</strong>. We will contact you within <strong>24 hours</strong> and
          confirm your order through WhatsApp or a phone call.
          <br /><br />
          <strong>M/S Angel Pattasu Kadai</strong> (Licence No: <strong>E/SS/TN/24/312(E11)2020</strong>) follows 100%
          legal &amp; statutory compliance — all our shops and go-downs are maintained as per the Explosives Act. We
          dispatch parcels only through registered and legal transport service providers, as every major company in
          Sivakasi does. Add your enquiries and enjoy your Diwali with <strong>Angel Fireworks</strong>! 🎆
        </Typography>
      </Box>
    </Box>
  </Container>
);

export default LegalNotice;
