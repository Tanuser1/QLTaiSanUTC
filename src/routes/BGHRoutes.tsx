import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import BGHDashboard from '../pages/BGH/BGHDashboard';

export const bghRouteElements = (
  <React.Fragment>
    {/* dashboard → redirect về bienban (trang chính của BGH) */}
    <Route path="dashboard" element={<Navigate to="../bienban" replace />} />
    <Route path="bienban"   element={<BGHDashboard />} />
  </React.Fragment>
);
