import React from 'react';
import { Route } from 'react-router-dom';
import BGHDashboard from '../pages/BGH/BGHDashboard';

export const bghRouteElements = (
  <React.Fragment>
    <Route path="dashboard" element={<BGHDashboard />} />
    <Route path="bienban" element={<BGHDashboard />} />
  </React.Fragment>
);
