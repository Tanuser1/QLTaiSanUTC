import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import KTVDashboard from '../pages/KTV/KTVDashboard';
import KTVLapBienBan from '../pages/KTV/KTVLapBienBan';
import KTVBienBan from '../pages/KTV/KTVBienBan';

export const ktvRouteElements = (
  <React.Fragment>
    <Route path="dashboard" element={<Navigate to="../yeucau" replace />} />
    <Route path="yeucau" element={<KTVDashboard />} />
    <Route path="yeucau/:id/lap-bien-ban" element={<KTVLapBienBan />} />
    <Route path="bienban" element={<KTVBienBan />} />
  </React.Fragment>
);
