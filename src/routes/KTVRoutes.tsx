import React from 'react';
import { Route } from 'react-router-dom';
import KTVDashboard from '../pages/KTV/KTVDashboard';
import KTVLapBienBan from '../pages/KTV/KTVLapBienBan';
import KTVBienBan from '../pages/KTV/KTVBienBan';

export const ktvRouteElements = (
  <React.Fragment>
    <Route path="dashboard" element={<KTVDashboard />} />
    <Route path="yeucau/:id/lap-bien-ban" element={<KTVLapBienBan />} />
    <Route path="bienban" element={<KTVBienBan />} />
  </React.Fragment>
);
