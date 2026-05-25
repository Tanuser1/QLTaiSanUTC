import React from 'react';
import { Route } from 'react-router-dom';
import GVDashboard from '../pages/GiaoVien/GVDashboard';
import GVYeuCau from '../pages/GiaoVien/GVYeuCau';
import GVGuiYeuCau from '../pages/GiaoVien/GVGuiYeuCau';

export const giaoVienRouteElements = (
  <React.Fragment>
    <Route path="dashboard" element={<GVDashboard />} />
    <Route path="yeucau" element={<GVYeuCau />} />
    <Route path="yeucau/tao-moi" element={<GVGuiYeuCau />} />
  </React.Fragment>
);
