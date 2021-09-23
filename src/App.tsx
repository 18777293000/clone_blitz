import React, { useRef, lazy, Suspense, useEffect, useState } from "react";
import { cache } from 'swr';
import { useObservable } from 'rxjs-hooks';
import { filter } from 'rxjs/operators';
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Notice = lazy(() => import('./render/help/pages/notices/notices'));
const App = () => {

  return (
    <div>
      hellow world
    </div>
  )
};
export default App;